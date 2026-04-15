export interface DashboardUser {
  is_admin?: number | null;
  role?: number | null;
}

function roleNumber(role: number | null | undefined): number | null {
  if (role === null || role === undefined) return null;
  const n = Number(role);
  return Number.isFinite(n) ? n : null;
}

export function getDashboardPathForUser(user: DashboardUser | null | undefined): string {
  if (!user) return "/auth/login";

  if (Number(user.is_admin) === 1) {
    return "/protected/adminDashboard";
  }

  const r = roleNumber(user.role);
  if (r === null) {
    return "/protected/clientDashboard";
  }

  switch (r) {
    case 0:
      return "/protected/teacherDashboard";
    case 1:
      return "/protected/adminDashboard";
    case 2:
      return "/protected/studentDashboard";
    case 3:
      return "/protected/clientDashboard";
    default:
      return "/protected/clientDashboard";
  }
}

