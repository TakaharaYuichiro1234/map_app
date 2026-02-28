<?php

namespace App\Models;

use PDO;

class Spot
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function findAll(): array
    {
        $sql = 'SELECT s.id, s.name, description, lat, lng, address, u.uuid as owner_uuid, s.created_at, s.updated_at 
                FROM spots s 
                LEFT JOIN users u 
                ON s.owner_id = u.id';
        $stmt = $this->pdo->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findById($id): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT s.id, s.name, description, lat, lng, address, u.uuid as owner_uuid, s.created_at, s.updated_at 
             FROM spots s 
             LEFT JOIN users u 
             ON s.owner_id = u.id 
             WHERE s.id = ?
             LIMIT 1'
        );
        $stmt->execute([$id]);
        $spot = $stmt->fetch();
        return $spot ?: null;
    }

    public function insert(array $data): int
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO spots (name, description, lat, lng, address, owner_id) VALUES (?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([$data['name'], $data['description'], $data['lat'], $data['lng'],  $data['address'],  $data['owner_id']]);

        return (int)$this->pdo->lastInsertId();
    }

    public function update($id, $userId, $name, $description): void
    {
        $sqlParam = '';
        $exeParam = [];
        if ($name) {
            $sqlParam .= 'name = ?, ';
            $exeParam[] = $name;
        }
        if ($description) {
            $sqlParam .= 'description = ?, ';
            $exeParam[] = $description;
        }

        $sql = 'UPDATE spots SET ' . $sqlParam . 'updated_at = NOW() WHERE id = ? AND owner_id = ?';
        $exeParam[] = $id;
        $exeParam[] = $userId;

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($exeParam);
    }

    public function delete(int $spotId, int $userId): void
    {
        $dir = __DIR__ . "/../../public/uploads/$spotId/";

        try {
            $this->pdo->beginTransaction();

            // ① spot削除（photosはCASCADE）
            $stmt = $this->pdo->prepare(
                'DELETE FROM spots WHERE id = ? AND owner_id = ?'
            );
            $stmt->execute([$spotId, $userId]);

            $this->pdo->commit();

            // ② フォルダ削除（安全チェック付き）
            $baseDir   = realpath(__DIR__ . '/../../public/uploads');
            $targetDir = realpath($dir);

            if (
                $targetDir &&
                $baseDir &&
                str_starts_with($targetDir, $baseDir)
            ) {
                $this->deleteDirectory($targetDir);
            }
        } catch (\Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    private function deleteDirectory(string $dir): void
    {
        $files = scandir($dir);

        foreach ($files as $file) {
            if ($file !== '.' && $file !== '..') {
                $path = $dir . '/' . $file;

                if (is_dir($path)) {
                    $this->deleteDirectory($path);
                } else {
                    unlink($path);
                }
            }
        }

        rmdir($dir);
    }
}
