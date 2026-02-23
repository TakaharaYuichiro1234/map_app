<?php

namespace App\Models;

use PDO;
use finfo;

class Photo
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function store($spotId, $userId, $file)
    {
        // 100枚制限チェック
        $stmt = $this->pdo->prepare(
            "SELECT COUNT(*) FROM photos WHERE spot_id = ?"
        );
        $stmt->execute([$spotId]);

        if ($stmt->fetchColumn() >= 100) {
            return ['error' => 'Max 100 photos allowed'];
        }

        // MIMEチェック
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($file['tmp_name']);

        $allowed = [
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
        ];

        if (!isset($allowed[$mime])) {
            return ['error' => 'Invalid file type'];
        }

        // ディレクトリ作成
        $dir = __DIR__ . "/../../public/uploads/$spotId/";
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $filename = bin2hex(random_bytes(16)) . '.' . $allowed[$mime];
        $path = $dir . $filename;

        move_uploaded_file($file['tmp_name'], $path);





        // 現在の最大sort_order取得
        $stmt = $this->pdo->prepare(
            'SELECT COALESCE(MAX(sort_order), -1) FROM photos WHERE spot_id = ?'
        );
        $stmt->execute([$spotId]);
        $maxSort = (int)$stmt->fetchColumn();

        $newSort = $maxSort + 1;



        // DB保存
        $stmt = $this->pdo->prepare(
            "INSERT INTO photos (spot_id, user_id, filename, sort_order)
             VALUES (?, ?, ?, ?)"
        );
        $stmt->execute([$spotId, $userId, $filename, $newSort]);

        return ['success' => true];
    }

    public function getBySpotId(int $spotId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT p.id, p.spot_id, u.uuid, p.filename, p.sort_order, p.created_at
            FROM photos p
            LEFT JOIN users u 
            ON p.user_id = u.id
            WHERE spot_id = ?
            ORDER BY sort_order ASC, p.created_at ASC'
        );

        $stmt->execute([$spotId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getMain(int $spotId): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT 
                p.id,
                p.spot_id,
                u.uuid,
                p.filename,
                p.sort_order,
                p.created_at
            FROM photos p
            LEFT JOIN users u ON p.user_id = u.id
            WHERE p.spot_id = ?
            ORDER BY p.sort_order ASC, p.created_at ASC
            LIMIT 1'
        );

        $stmt->execute([$spotId]);

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function delete(int $photoId): bool
    {
        // ① filename取得
        $stmt = $this->pdo->prepare(
            'SELECT filename FROM photos WHERE id = ?'
        );
        $stmt->execute([$photoId]);
        $photo = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$photo) {
            return false;
        }

        $filePath = __DIR__ . '/../../public/uploads/' . $photo['filename'];

        try {
            $this->pdo->beginTransaction();

            // ② DB削除
            $stmt = $this->pdo->prepare(
                'DELETE FROM photos WHERE id = ?'
            );
            $stmt->execute([$photoId]);

            // ③ ファイル削除
            if (file_exists($filePath)) {
                unlink($filePath);
            }

            $this->pdo->commit();
            return true;
        } catch (\Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    // public function reorder(int $spotId, int $targetPhotoId): array {
    //     $errors = [];
    //     try {
    //         $this->pdo->beginTransaction();

    //         $stmt = $this->pdo->prepare(
    //             'SELECT id
    //             FROM photos
    //             WHERE spot_id = ?
    //             ORDER BY sort_order ASC, created_at ASC'
    //         );

    //         $stmt->execute([$spotId]);
    //         $srcPhotos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    //         $srcPhotoIds = array_column($srcPhotos, 'id');

    //         $target = array_search($targetPhotoId, $srcPhotoIds);   
    //         if (!$target) {
    //             $errors[] = '写真が存在しない';
    //             return $errors;
    //         }

    //         $dstPhotoIds[] = $targetPhotoId;
    //         foreach ($srcPhotoIds as $photoId) {
    //             if ($photoId === $targetPhotoId) continue;
    //             $dstPhotoIds[] = $photoId;
    //         }

    //         foreach ($dstPhotoIds as $index => $photoId) {
    //             $stmt = $this->pdo->prepare(
    //                 'UPDATE photos SET sort_order = ? WHERE id = ?'
    //             );
    //             $stmt->execute([$index, $photoId]);
    //         }

    //         $this->pdo->commit();
    //         return $errors;

    //     } catch (\Throwable $e) {
    //         $this->pdo->rollBack();
    //         // throw $e;
    //         $errors[] = $e->getMessage();
    //         return $errors;
    //     }
    // }
    public function reorder(int $spotId, int $targetPhotoId): array
    {
        $errors = [];

        try {
            $this->pdo->beginTransaction();

            $stmt = $this->pdo->prepare(
                'SELECT id
                    FROM photos
                    WHERE spot_id = ?
                    ORDER BY sort_order ASC, created_at ASC'
            );
            $stmt->execute([$spotId]);
            $srcPhotos = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $srcPhotoIds = array_column($srcPhotos, 'id');

            $targetIndex = array_search($targetPhotoId, $srcPhotoIds);

            if ($targetIndex === false) {
                $this->pdo->rollBack();
                $errors[] = '写真が存在しない';
                return $errors;
            }

            $dstPhotoIds = [];
            $dstPhotoIds[] = $targetPhotoId;

            foreach ($srcPhotoIds as $photoId) {
                if ($photoId === $targetPhotoId) continue;
                $dstPhotoIds[] = $photoId;
            }

            $updateStmt = $this->pdo->prepare(
                'UPDATE photos SET sort_order = ? WHERE id = ?'
            );

            foreach ($dstPhotoIds as $index => $photoId) {
                $updateStmt->execute([$index, $photoId]);
            }

            $this->pdo->commit();
            return [];
        } catch (\Throwable $e) {
            $this->pdo->rollBack();
            return [$e->getMessage()];
        }
    }
}
