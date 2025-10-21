import { ReactNode } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { Lock } from 'lucide-react';

interface ProtectedActionProps {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  children: ReactNode;
  fallback?: ReactNode;
  showLock?: boolean;
}

export function ProtectedAction({
  resource,
  action,
  children,
  fallback,
  showLock = false,
}: ProtectedActionProps) {
  const { hasPermission, loading } = usePermissions();

  if (loading) {
    return null;
  }

  const allowed = hasPermission(resource, action);

  if (!allowed) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showLock) {
      return (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 rounded-lg cursor-not-allowed">
          <Lock className="h-4 w-4" />
          <span className="text-sm font-medium">No Permission</span>
        </div>
      );
    }

    return null;
  }

  return <>{children}</>;
}

interface RequireRoleProps {
  roles: Array<'admin' | 'manager' | 'seller' | 'viewer'>;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequireRole({ roles, children, fallback }: RequireRoleProps) {
  const { role, loading } = usePermissions();

  if (loading) {
    return null;
  }

  if (!roles.includes(role)) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}

interface PermissionGateProps {
  permissions: Array<{ resource: string; action: string }>;
  requireAll?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({
  permissions,
  requireAll = false,
  children,
  fallback,
}: PermissionGateProps) {
  const { hasPermission, loading } = usePermissions();

  if (loading) {
    return null;
  }

  const allowed = requireAll
    ? permissions.every((p) => hasPermission(p.resource, p.action))
    : permissions.some((p) => hasPermission(p.resource, p.action));

  if (!allowed) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}

export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <RequireRole roles={['admin']} fallback={fallback}>{children}</RequireRole>;
}

export function ManagerOrAbove({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <RequireRole roles={['admin', 'manager']} fallback={fallback}>{children}</RequireRole>;
}
