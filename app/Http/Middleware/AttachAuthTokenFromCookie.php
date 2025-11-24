<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AttachAuthTokenFromCookie
{
  /**
   * Pull the Sanctum token from the auth cookie and attach it as a bearer header
   * so downstream middleware can authenticate the request.
   */
  public function handle(Request $request, Closure $next): Response
  {
    if (!$request->bearerToken() && $request->hasCookie('auth_token')) {
      $request->headers->set('Authorization', 'Bearer ' . $request->cookie('auth_token'));
    }

    return $next($request);
  }
}
