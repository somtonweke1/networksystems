"""
Custom exception handlers for the centrality service
"""

import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.schemas.centrality import ErrorResponse

logger = logging.getLogger(__name__)


class NetworkOracleException(Exception):
    """Base exception for NetworkOracle services"""
    pass


class NetworkTooLargeException(NetworkOracleException):
    """Raised when network exceeds size limits"""
    pass


class InvalidNetworkException(NetworkOracleException):
    """Raised when network structure is invalid"""
    pass


class AlgorithmException(NetworkOracleException):
    """Raised when algorithm computation fails"""
    pass


def setup_exception_handlers(app: FastAPI):
    """Setup custom exception handlers"""
    
    @app.exception_handler(NetworkTooLargeException)
    async def network_too_large_handler(request: Request, exc: NetworkTooLargeException):
        logger.warning(f"Network too large: {str(exc)}")
        return JSONResponse(
            status_code=413,
            content=ErrorResponse(
                success=False,
                error_code="NETWORK_TOO_LARGE",
                error_message=str(exc),
                timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            ).dict()
        )
    
    @app.exception_handler(InvalidNetworkException)
    async def invalid_network_handler(request: Request, exc: InvalidNetworkException):
        logger.warning(f"Invalid network: {str(exc)}")
        return JSONResponse(
            status_code=400,
            content=ErrorResponse(
                success=False,
                error_code="INVALID_NETWORK",
                error_message=str(exc),
                timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            ).dict()
        )
    
    @app.exception_handler(AlgorithmException)
    async def algorithm_exception_handler(request: Request, exc: AlgorithmException):
        logger.error(f"Algorithm error: {str(exc)}")
        return JSONResponse(
            status_code=500,
            content=ErrorResponse(
                success=False,
                error_code="ALGORITHM_ERROR",
                error_message=str(exc),
                timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            ).dict()
        )
    
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        logger.warning(f"Validation error: {exc.errors()}")
        return JSONResponse(
            status_code=422,
            content=ErrorResponse(
                success=False,
                error_code="VALIDATION_ERROR",
                error_message="Request validation failed",
                details={"errors": exc.errors()},
                timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            ).dict()
        )
    
    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        logger.warning(f"HTTP error {exc.status_code}: {exc.detail}")
        return JSONResponse(
            status_code=exc.status_code,
            content=ErrorResponse(
                success=False,
                error_code=f"HTTP_{exc.status_code}",
                error_message=str(exc.detail),
                timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            ).dict()
        )
    
    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content=ErrorResponse(
                success=False,
                error_code="INTERNAL_SERVER_ERROR",
                error_message="An internal server error occurred",
                timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            ).dict()
        )
