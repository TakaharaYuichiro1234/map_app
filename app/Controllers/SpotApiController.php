<?php

namespace App\Controllers;

use PDO;
use RuntimeException;
use App\Core\BaseApiController;
use App\Models\Spot;
use App\Models\User;

class SpotApiController extends BaseApiController
{
    private PDO $pdo;
    private Spot $spotModel;
    private User $userModel;

    public function __construct()
    {
        require __DIR__ . '/../../config/db.php';
        $this->pdo = $pdo;
        $this->spotModel = new Spot($this->pdo);
        $this->userModel = new User($this->pdo);
    }

    public function index()
    {
        try {
            $spots = $this->spotModel->findAll();
            $this->jsonResponse([
                'success' => true,
                'spots' => $spots,
                'errors' => [],
            ]);
        } catch (\Throwable $e) {
            $this->jsonResponse([
                'success' => false,
                'errors'  => ['データベースエラー'],
            ], 400);
        }
    }

    public function show($id)
    {
        try {
            $spot =  $this->spotModel->findById($id);
            $this->jsonResponse([
                'success' => true,
                'spot' => $spot,
                'errors' => [],
            ]);
        } catch (\Throwable $e) {
            $this->jsonResponse([
                'success' => false,
                'errors'  => ['データベースエラー'],
            ], 400);
        }
    }

    public function store()
    {
        try {
            $uuid = $_SESSION['user']['uuid'];
            $userId = $this->userModel->getUserIdByUuid($uuid);

            if ($userId === null) {
                throw new RuntimeException('ユーザーが存在しません', 400);
            }

            $data = [
                'name' => $_POST['name'],
                'description' =>  $_POST['description'],
                'lat' => $_POST['lat'],
                'lng' => $_POST['lng'],
                'address' => $_POST['address'],
                'owner_id' => $userId,
            ];

            $spotId = $this->spotModel->insert($data);
            $this->jsonResponse([
                'success' => true,
                'spotId' => $spotId,
                'errors' => [],
            ]);
        } catch (\Throwable $e) {
            $this->jsonResponse([
                'success' => false,
                'errors'  => ['書き込みエラー'],
            ], 400);
        }
    }

    public function update()
    {
        try {
            $uuid = $_SESSION['user']['uuid'];
            $userId = $this->userModel->getUserIdByUuid($uuid);
            if ($userId === null) {
                throw new RuntimeException('ユーザーが存在しません', 400);
            }

            $id = $_POST['id'];
            $name = $_POST['name'] ?? null;
            $description = $_POST['description'] ?? null;
            $ret = $this->spotModel->update($id, $userId, $name, $description);

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

    public function destroy()
    {
        try {
            $uuid = $_SESSION['user']['uuid'];
            $userId = $this->userModel->getUserIdByUuid($uuid);
            if ($userId === null) {
                throw new RuntimeException('ユーザーが存在しません', 400);
            }

            $id = $_POST['id'];
            $ret = $this->spotModel->delete($id, $userId);

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
}
