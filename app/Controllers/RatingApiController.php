<?php

namespace App\Controllers;

use PDO;
use RuntimeException;
use App\Core\BaseApiController;
use App\Models\Rating;
use App\Models\User;

class RatingApiController extends BaseApiController
{
    private PDO $pdo;
    private Rating $ratingModel;
    private User $userModel;

    public function __construct()
    {
        require __DIR__ . '/../../config/db.php';
        $this->pdo = $pdo;
        $this->ratingModel = new Rating($this->pdo);
        $this->userModel = new User($this->pdo);
    }

    public function index()
    {
        try {
            $ratings =  $this->ratingModel->all();
            $this->jsonResponse([
                'success' => true,
                'ratings' => $ratings,
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
            $rating =  $this->ratingModel->findById($id);
            $this->jsonResponse([
                'success' => true,
                'rating' => $rating,
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
            $uuid = $_POST['uuid']; // dummyのときはPOSTにuuidが入ってくる
            if (!$uuid) {
                $uuid = $_SESSION['user']['uuid'];  // 通常の場合は、SESSIONからuuidを受ける
            }
            $userId = $this->userModel->getUserIdByUuid($uuid);
            if ($userId === null) {
                throw new RuntimeException('ユーザーが存在しません', 400);
            }

            $data = [
                'spot_id' => $_POST['spot_id'],
                'user_id' =>  $userId,
                'date' => $_POST['date'],
                'rating' => $_POST['rating'],
                'comment' => $_POST['comment'],
            ];

            $ratingId = $this->ratingModel->insert($data);
            $this->jsonResponse([
                'success' => true,
                'ratingId' => $ratingId,
                'errors' => [],
            ]);
        } catch (\Throwable $e) {
            $this->jsonResponse([
                'success' => false,
                'errors'  => ['書き込みエラー'],
            ], 400);
        }
    }

    // public function update() {
    //     try {
    //         $ratingId = $this->ratingModel->update($_POST);
    //         $this->jsonResponse([
    //             'success' => true,
    //             'errors' => [],
    //         ]);

    //     } catch (\Throwable $e) {
    //         $this->jsonResponse([
    //             'success' => false,
    //             'errors'  => ['書き込みエラー'],
    //         ], 400);
    //     }
    // }

    public function destroy()
    {
        try {
            $uuid = $_SESSION['user']['uuid'];
            $userId = $this->userModel->getUserIdByUuid($uuid);
            if ($userId === null) {
                throw new RuntimeException('ユーザーが存在しません', 400);
            }

            $id = $_POST['id'];
            $this->ratingModel->delete($id, $userId);
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

    public function getBySpotId($spotId)
    {
        try {
            $ratings =  $this->ratingModel->filterBySpotId($spotId);
            $this->jsonResponse([
                'success' => true,
                'ratings' => $ratings,
                'errors' => [],
            ]);
        } catch (\Throwable $e) {
            $this->jsonResponse([
                'success' => false,
                'errors'  => ['データベースエラー'],
            ], 400);
        }
    }

    public function isRated($spot_id, $uuid, $date)
    {
        try {
            $userId = $this->userModel->getUserIdByUuid($uuid);

            if ($userId === null) {
                throw new RuntimeException('ユーザーが存在しません', 400);
            }

            if (!$spot_id || !$date) {
                throw new RuntimeException('invalid request', 400);
            }

            $isRated =  $this->ratingModel->isRated($spot_id, $userId, $date);
            $this->jsonResponse([
                'success' => true,
                'is_rated' => $isRated,
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
