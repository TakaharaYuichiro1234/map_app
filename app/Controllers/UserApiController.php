<?php
namespace App\Controllers;

use PDO;
use App\Core\Auth;
use App\Core\BaseApiController;
use App\Models\Spot;
use App\Models\User;

class UserApiController extends BaseApiController {
    private PDO $pdo;
    private Spot $spotModel;
    private User $userModel;

    public function __construct() {
        require __DIR__ . '/../../config/db.php';
        $this->pdo = $pdo;
        $this->spotModel = new Spot($this->pdo);
        $this->userModel = new User($this->pdo);
    }

    public function index() {
        try {
            $users = $this->userModel->all();
            $this->jsonResponse([
                'success' => true,
                'users' => $users,
                'errors' => [],
            ]);

        } catch (\Throwable $e) {
            $this->jsonResponse([
                'success' => false,
                'errors'  => ['データベースエラー'],
            ], 400);
        }
    }  
    
    public function show($uuid) {
        try {
            $user = $this->userModel->findByUuid($uuid);
            $this->jsonResponse([
                'success' => true,
                'user' => $user,
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
