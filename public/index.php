<?php

session_name('MAP_APP_SESSID');
session_start();
define('BASE_PATH', '/map_app');
require_once __DIR__ . '/../vendor/autoload.php';

use App\Core\Router;
use App\Core\Auth;
use App\Middlewares\AdminMiddleware;
use App\Middlewares\UserMiddleware;
use App\Middlewares\CsrfMiddleware;

use App\Controllers\AuthController;
use App\Controllers\SpotController;
use App\Controllers\SpotApiController;
use App\Controllers\RatingApiController;
use App\Controllers\PhotoApiController;
use App\Controllers\UserApiController;
use App\Controllers\ManualController;

$router = new Router();

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if (strpos($uri, BASE_PATH) === 0) {
    $uri = substr($uri, strlen(BASE_PATH));
}
if ($uri === '') {
    $uri = '/';
}

$method = $_SERVER['REQUEST_METHOD'];

$router->add('GET', '/show_login', AuthController::class, 'showLogin');
$router->add('POST', '/login', AuthController::class, 'login');
$router->add('POST', '/logout', AuthController::class, 'logout');
$router->add('GET', '/manuals', ManualController::class, 'index');

$router->add('GET', '/api/users', UserApiController::class, 'index');
$router->add('GET', '/api/users/{uuid}', UserApiController::class, 'show');

$router->add('GET', '/', SpotController::class, 'index');
$router->add('GET', '/spots', SpotController::class, 'index');
$router->add('GET', '/spots/create', SpotController::class, 'create', [UserMiddleware::class]);
$router->add('GET', '/spots/{id:\d+}', SpotController::class, 'show');

$router->add('GET', '/api/spots', SpotApiController::class, 'index');
$router->add('GET', '/api/spots/{id:\d+}', SpotApiController::class, 'show');
$router->add('POST', '/api/spots/store', SpotApiController::class, 'store', [UserMiddleware::class, CsrfMiddleware::class]);
$router->add('POST', '/api/spots/delete', SpotApiController::class, 'destroy', [UserMiddleware::class, CsrfMiddleware::class]);
$router->add('POST', '/api/spots/update', SpotApiController::class, 'update', [UserMiddleware::class, CsrfMiddleware::class]);

// $router->add('GET', '/api/ratings/get_by_spot_id/{spot_id}', RatingApiController::class, 'getBySpotId');
$router->add('GET', '/api/ratings', RatingApiController::class, 'index');
$router->add('POST', '/api/ratings/store', RatingApiController::class, 'store', [UserMiddleware::class, CsrfMiddleware::class]);
$router->add('POST', '/api/ratings/delete', RatingApiController::class, 'destroy', [UserMiddleware::class, CsrfMiddleware::class]);
$router->add('GET', '/api/ratings/is_rated/{spot_id}/{user_id}/{date}', RatingApiController::class, 'isRated');
$router->add('GET', '/api/ratings/{id:\d+}', RatingApiController::class, 'show');

$router->add('GET', '/api/photos/get_by_spot_id/{spot_id:\d+}', PhotoApiController::class, 'getBySpotId');
$router->add('GET', '/api/photos/get_main/{spot_id:\d+}', PhotoApiController::class, 'getMain');
$router->add('POST', '/api/photos/store', PhotoApiController::class, 'store', [UserMiddleware::class, CsrfMiddleware::class]);
$router->add('POST', '/api/photos/delete', PhotoApiController::class, 'delete', [UserMiddleware::class, CsrfMiddleware::class]);
$router->add('POST', '/api/photos/reorder', PhotoApiController::class, 'reorder', [UserMiddleware::class, CsrfMiddleware::class]);

$router->dispatch($method, $uri);
