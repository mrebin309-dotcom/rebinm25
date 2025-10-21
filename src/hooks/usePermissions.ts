import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export type UserRole = 'admin' | 'manager' | 'seller' | 'viewer';

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
}

export function usePermissions() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>('viewer');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserRole();
    } else {
      setRole('viewer');
      setPermissions([]);
      setLoading(false);
    }
  }, [user]);

  const loadUserRole = async () => {
    if (!user) return;

    try {
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      const currentRole = (userRole?.role as UserRole) || 'viewer';
      setRole(currentRole);

      if (currentRole === 'admin') {
        setPermissions([]);
        setLoading(false);
        return;
      }

      const { data: rolePerms } = await supabase
        .from('role_permissions')
        .select(`
          permission_id,
          permissions (
            id,
            name,
            resource,
            action
          )
        `)
        .eq('role', currentRole);

      const perms = rolePerms?.map(rp => (rp as any).permissions).filter(Boolean) || [];
      setPermissions(perms);
    } catch (error) {
      console.error('Error loading permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (role === 'admin') return true;

    return permissions.some(
      p => p.resource === resource && (p.action === action || p.action === 'manage')
    );
  };

  const canCreate = (resource: string) => hasPermission(resource, 'create');
  const canRead = (resource: string) => hasPermission(resource, 'read');
  const canUpdate = (resource: string) => hasPermission(resource, 'update');
  const canDelete = (resource: string) => hasPermission(resource, 'delete');
  const canManage = (resource: string) => hasPermission(resource, 'manage');

  const isAdmin = role === 'admin';
  const isManager = role === 'manager';
  const isSeller = role === 'seller';
  const isViewer = role === 'viewer';

  return {
    role,
    permissions,
    loading,
    hasPermission,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canManage,
    isAdmin,
    isManager,
    isSeller,
    isViewer,
  };
}

export function useAuditLog() {
  const { user } = useAuth();

  const logAction = async (
    action: string,
    resourceType: string,
    resourceId: string = '',
    oldValues: any = {},
    newValues: any = {}
  ) => {
    if (!user) return;

    try {
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        old_values: oldValues,
        new_values: newValues,
        ip_address: '',
        user_agent: navigator.userAgent,
      });
    } catch (error) {
      console.error('Error logging action:', error);
    }
  };

  return { logAction };
}
