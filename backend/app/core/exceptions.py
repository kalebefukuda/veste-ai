class DomainError(Exception):
    """Base for business rule violations. Routers are the only layer that maps these to HTTP."""
