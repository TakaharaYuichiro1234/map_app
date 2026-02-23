<?php

namespace App\Models;

use PDO;

class User
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function all(): array
    {
        $sql = 'SELECT uuid, name, role FROM users';
        $stmt = $this->pdo->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findByUuid($uuid): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT uuid, name, role FROM users WHERE uuid = ? LIMIT 1'
        );
        $stmt->execute([$uuid]);
        $user = $stmt->fetch();
        return $user ?: null;
    }

    public function getUserIdByUuid($uuid): ?int
    {
        $stmt = $this->pdo->prepare(
            'SELECT id FROM users WHERE uuid = ?'
        );
        $stmt->execute([$uuid]);
        $user_id = $stmt->fetchColumn();
        return $user_id !== false ? (int)$user_id : null;
    }
}
