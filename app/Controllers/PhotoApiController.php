<?php

namespace App\Controllers;

use PDO;
use RuntimeException;
use App\Core\BaseApiController;
use App\Models\Photo;
use App\Models\User;

class PhotoApiController extends BaseApiController
{
    private PDO $pdo;
    private Photo $photoModel;
    private User $userModel;

    public function __construct()
    {
        require __DIR__ . '/../../config/db.php';
        $this->pdo = $pdo;
        $this->photoModel = new Photo($this->pdo);
        $this->userModel = new User($this->pdo);
    }

    public function getBySpotId(int $spotId)
    {
        $photos = $this->photoModel->getBySpotId($spotId);

        // 画像URLを付与
        foreach ($photos as &$photo) {
            $photo['url'] = BASE_PATH . '/public/uploads/' . $photo['filename'];
        }

        $this->jsonResponse([
            'success' => true,
            'photos' => $photos
        ]);
    }

    public function getMain(int $spotId)
    {
        $photo = $this->photoModel->getMain($spotId);

        $this->jsonResponse([
            'success' => true,
            'photo' => $photo
        ]);
    }


    public function store()
    {
        try {
            $uuid = $_SESSION['user']['uuid'];
            $userId = $this->userModel->getUserIdByUuid($uuid);
            if ($userId === null) {
                throw new RuntimeException('ユーザーが存在しません', 400);
                return;
            }

            if (!isset($_FILES['photo'], $_POST['spot_id'])) {
                throw new RuntimeException('Invalid request', 400);
                return;
            }

            $result = $this->photoModel->store(
                $_POST['spot_id'],
                $userId,
                $_FILES['photo']
            );

            if (isset($result['error'])) {
                throw new RuntimeException('Invalid request', 400);
                return;
            }

            $this->jsonResponse([
                'success' => true,
                'errors' => [],
            ]);
        } catch (\Throwable $e) {
            $this->jsonResponse([
                'success' => false,
                'errors'  => ['データベースエラー'],
            ], 400);
        }
    }

    public function delete()
    {
        try {
            $id = $_POST['id'];
            $success = $this->photoModel->delete($id);
            if (!$success) {
                throw new RuntimeException('Invalid request', 400);
                return;
            }

            $this->jsonResponse([
                'success' => true,
                'errors' => [],
            ]);
        } catch (\Throwable $e) {
            $this->jsonResponse([
                'success' => false,
                'errors'  => ['データベースエラー'],
            ], 400);
        }
    }

    public function reorder()
    {
        try {
            $spotId = $_POST['spot_id'];
            $targetPhotoId = $_POST['id'];
            $errors = $this->photoModel->reorder($spotId, $targetPhotoId);

            $this->jsonResponse([
                'success' => true,
                'errors' => $errors,
            ]);
        } catch (\Throwable $e) {
            $this->jsonResponse([
                'success' => false,
                'errors'  => ['データベースエラー'],
            ], 400);
        }
    }
}
