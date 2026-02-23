<?php

namespace App\Models;

use PDO;

class Rating
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function all(): array
    {
        // $sql = 'SELECT * FROM ratings';
        $sql =
            'SELECT r.id, r.spot_id, u.uuid, r.date, r.rating, r.comment, r.created_at, r.updated_at 
             FROM ratings r 
             LEFT JOIN users u 
             ON r.user_id = u.id';
        $stmt = $this->pdo->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findById($id): ?array
    {
        // $stmt = $this->pdo->prepare(
        //     'SELECT * FROM ratings WHERE id = ? LIMIT 1'
        // );
        $stmt = $this->pdo->prepare(
            'SELECT r.id, spot_id, uuid, date, rating, comment, r.created_at, r.updated_at 
             FROM ratings r 
             LEFT JOIN users u 
             ON r.user_id = u.id
             WHERE r.id = ? 
             LIMIT 1'
        );
        $stmt->execute([$id]);
        $rating = $stmt->fetch();
        return $rating ?: null;
    }



    // spotId, userId, rating, comment, createdAt
    public function insert(array $data): int
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO ratings (spot_id, user_id, date, rating, comment) VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([$data['spot_id'], $data['user_id'], $data['date'], $data['rating'], $data['comment']]);

        return (int)$this->pdo->lastInsertId();
    }

    public function update(int $id, array $data): void
    {
        // $stmt = $this->pdo->prepare(
        //     'UPDATE stocks SET name = ?, digit = ?, updated_at = NOW() WHERE id = ?'
        // );
        // $stmt->execute([$data['name'], (int)$data['digit'], $id]);
    }

    public function delete(int $id, int $userId): void
    {
        $stmt = $this->pdo->prepare(
            'DELETE FROM ratings WHERE id = ? AND user_id = ?'
        );
        $stmt->execute([$id, $userId]);
    }

    public function filterBySpotId($spotId): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT r.id, r.spot_id, u.uuid, r.date, r.rating, r.comment, r.created_at, r.updated_at 
             FROM ratings r 
             LEFT JOIN users u 
             ON r.user_id = u.id
             WHERE r.spot_id = ? 
             ORDER BY r.date DESC'
        );
        $stmt->execute([$spotId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function isRated($spotId, $userId, $date): bool
    {
        $stmt = $this->pdo->prepare(
            'SELECT 1 FROM ratings WHERE spot_id = ? AND user_id = ? AND date = ? LIMIT 1'
        );

        $stmt->execute([$spotId, $userId, $date]);

        return $stmt->fetch() !== false;
    }
}
