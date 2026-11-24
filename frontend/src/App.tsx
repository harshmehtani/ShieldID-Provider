import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { homeFor } from './lib/access'

const LandingPage = lazy(() => import('./pages/public/LandingPage').then((page) => ({ default: page.LandingPage })))
const PublicVerifyCredentialPage = lazy(() => import('./pages/public/VerifyCredentialPage').then((page) => ({ default: page.VerifyCredentialPage })))
const VerificationResultPage = lazy(() => import('./pages/public/VerificationResultPage').then((page) => ({ default: page.VerificationResultPage })))
const OrganizationLoginPage = lazy(() => import('./pages/auth/OrganizationLoginPage').then((page) => ({ default: page.OrganizationLoginPage })))
const IdentityManagerLoginPage = lazy(() => import('./pages/auth/IdentityManagerLoginPage').then((page) => ({ default: page.IdentityManagerLoginPage })))
const CitizenLoginPage = lazy(() => import('./pages/auth/CitizenLoginPage').then((page) => ({ default: page.CitizenLoginPage })))
const AdminLoginPage = lazy(() => import('./pages/auth/AdminLoginPage').then((page) => ({ default: page.AdminLoginPage })))
const OrganizationRegistrationPage = lazy(() => import('./pages/auth/OrganizationRegistrationPage').then((page) => ({ default: page.OrganizationRegistrationPage })))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage').then((page) => ({ default: page.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage').then((page) => ({ default: page.ResetPasswordPage })))

const ProfilePage = lazy(() => import('./pages/shared/ProfilePage').then((page) => ({ default: page.ProfilePage })))
const NotificationsPage = lazy(() => import('./pages/shared/NotificationsPage').then((page) => ({ default: page.NotificationsPage })))
const AccessDeniedPage = lazy(() => import('./pages/shared/AccessDeniedPage').then((page) => ({ default: page.AccessDeniedPage })))
const NotFoundPage = lazy(() => import('./pages/shared/NotFoundPage').then((page) => ({ default: page.NotFoundPage })))

const OrgDashboard = lazy(() => import('./pages/organization/OrgDashboard').then((page) => ({ default: page.OrgDashboard })))
const OrgManagersPage = lazy(() => import('./pages/organization/OrgManagersPage').then((page) => ({ default: page.OrgManagersPage })))
const OrgManagerDetailsPage = lazy(() => import('./pages/organization/OrgManagerDetailsPage').then((page) => ({ default: page.OrgManagerDetailsPage })))
const OrgAddManagerPage = lazy(() => import('./pages/organization/OrgAddManagerPage').then((page) => ({ default: page.OrgAddManagerPage })))
const OrgDetailsPage = lazy(() => import('./pages/organization/OrgDetailsPage').then((page) => ({ default: page.OrgDetailsPage })))
const OrgIdentitiesPage = lazy(() => import('./pages/organization/OrgIdentitiesPage').then((page) => ({ default: page.OrgIdentitiesPage })))
const OrgCredentialsPage = lazy(() => import('./pages/organization/OrgCredentialsPage').then((page) => ({ default: page.OrgCredentialsPage })))
const OrgCredentialDetailsPage = lazy(() => import('./pages/organization/OrgCredentialDetailsPage').then((page) => ({ default: page.OrgCredentialDetailsPage })))
const OrgIssueCredentialPage = lazy(() => import('./pages/organization/OrgIssueCredentialPage').then((page) => ({ default: page.OrgIssueCredentialPage })))
const OrgActivityPage = lazy(() => import('./pages/organization/OrgActivityPage').then((page) => ({ default: page.OrgActivityPage })))
const OrgProfilePage = lazy(() => import('./pages/organization/OrgProfilePage').then((page) => ({ default: page.OrgProfilePage })))

const ImDashboard = lazy(() => import('./pages/identity-manager/ImDashboard').then((page) => ({ default: page.ImDashboard })))
const ImCitizensPage = lazy(() => import('./pages/identity-manager/ImCitizensPage').then((page) => ({ default: page.ImCitizensPage })))
const ImCitizenDetailsPage = lazy(() => import('./pages/identity-manager/ImCitizenDetailsPage').then((page) => ({ default: page.ImCitizenDetailsPage })))
const ImRegisterCitizenPage = lazy(() => import('./pages/identity-manager/ImRegisterCitizenPage').then((page) => ({ default: page.ImRegisterCitizenPage })))
const ImIssueCredentialPage = lazy(() => import('./pages/identity-manager/ImIssueCredentialPage').then((page) => ({ default: page.ImIssueCredentialPage })))
const ImCredentialsPage = lazy(() => import('./pages/identity-manager/ImCredentialsPage').then((page) => ({ default: page.ImCredentialsPage })))
const ImCredentialDetailsPage = lazy(() => import('./pages/identity-manager/ImCredentialDetailsPage').then((page) => ({ default: page.ImCredentialDetailsPage })))
const ImProfilePage = lazy(() => import('./pages/identity-manager/ImProfilePage').then((page) => ({ default: page.ImProfilePage })))
const ImRevocationPage = lazy(() => import('./pages/identity-manager/ImRevocationPage').then((page) => ({ default: page.ImRevocationPage })))
const ImIdentitiesPage = lazy(() => import('./pages/identity-manager/ImIdentitiesPage').then((page) => ({ default: page.ImIdentitiesPage })))
const ImIdentityDetailsPage = lazy(() => import('./pages/identity-manager/ImIdentityDetailsPage').then((page) => ({ default: page.ImIdentityDetailsPage })))
const ImCreateIdentityPage = lazy(() => import('./pages/identity-manager/ImCreateIdentityPage').then((page) => ({ default: page.ImCreateIdentityPage })))
const ImReviewQueuePage = lazy(() => import('./pages/identity-manager/ImReviewQueuePage').then((page) => ({ default: page.ImReviewQueuePage })))
const ImTemplatesPage = lazy(() => import('./pages/identity-manager/ImTemplatesPage').then((page) => ({ default: page.ImTemplatesPage })))

const CitizenDashboard = lazy(() => import('./pages/citizen/CitizenDashboard').then((page) => ({ default: page.CitizenDashboard })))
const CitizenMyCredentialPage = lazy(() => import('./pages/citizen/CitizenMyCredentialPage').then((page) => ({ default: page.CitizenMyCredentialPage })))
const CitizenCredentialsPage = lazy(() => import('./pages/citizen/CitizenCredentialsPage').then((page) => ({ default: page.CitizenCredentialsPage })))
const CitizenCredentialDetailsPage = lazy(() => import('./pages/citizen/CitizenCredentialDetailsPage').then((page) => ({ default: page.CitizenCredentialDetailsPage })))
const CitizenPresentationsPage = lazy(() => import('./pages/citizen/CitizenPresentationsPage').then((page) => ({ default: page.CitizenPresentationsPage })))
const CitizenProfilePage = lazy(() => import('./pages/citizen/CitizenProfilePage').then((page) => ({ default: page.CitizenProfilePage })))
const CitizenSettingsPage = lazy(() => import('./pages/citizen/CitizenSettingsPage').then((page) => ({ default: page.CitizenSettingsPage })))
const CitizenVerificationHistoryPage = lazy(() => import('./pages/citizen/CitizenVerificationHistoryPage').then((page) => ({ default: page.CitizenVerificationHistoryPage })))

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then((page) => ({ default: page.AdminDashboard })))
const AdminOrgRequestsPage = lazy(() => import('./pages/admin/AdminOrgRequestsPage').then((page) => ({ default: page.AdminOrgRequestsPage })))
const AdminOrgRequestDetailsPage = lazy(() => import('./pages/admin/AdminOrgRequestDetailsPage').then((page) => ({ default: page.AdminOrgRequestDetailsPage })))
const AdminOrganizationsPage = lazy(() => import('./pages/admin/AdminOrganizationsPage').then((page) => ({ default: page.AdminOrganizationsPage })))
const AdminAuditLogsPage = lazy(() => import('./pages/admin/AdminAuditLogsPage').then((page) => ({ default: page.AdminAuditLogsPage })))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage').then((page) => ({ default: page.AdminUsersPage })))
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage').then((page) => ({ default: page.AdminSettingsPage })))
const AdminSystemStatusPage = lazy(() => import('./pages/admin/AdminSystemStatusPage').then((page) => ({ default: page.AdminSystemStatusPage })))
const AdminApiDocsPage = lazy(() => import('./pages/admin/AdminApiDocsPage').then((page) => ({ default: page.AdminApiDocsPage })))

const RootRedirect: React.FC = () => {
  const { currentUser } = useApp()
  if (!currentUser) return <LandingPage />
  return <Navigate to={homeFor(currentUser.role)} replace />
}

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="min-h-screen grid place-items-center text-sm text-slate-500">Loading ShieldID…</div>}>
        <Routes>
          {/* Public entry points. Verification is public and never needs a session. */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/verify" element={<PublicVerifyCredentialPage />} />
          <Route path="/verify/result" element={<VerificationResultPage />} />

          {/* Separate role sign-in routes keep organization and manager access distinct. */}
          <Route path="/org/login" element={<OrganizationLoginPage />} />
          <Route path="/im/login" element={<IdentityManagerLoginPage />} />
          <Route path="/citizen/login" element={<CitizenLoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/org/register" element={<OrganizationRegistrationPage />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/org/register" replace />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route element={<AppLayout />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/access-denied" element={<AccessDeniedPage />} />

            <Route element={<ProtectedRoute allowedRoles={['organization']} />}>
              <Route path="/org/dashboard" element={<OrgDashboard />} />
              <Route path="/org/details" element={<OrgDetailsPage />} />
              <Route path="/org/managers" element={<OrgManagersPage />} />
              <Route path="/org/managers/add" element={<OrgAddManagerPage />} />
              <Route path="/org/managers/:id" element={<OrgManagerDetailsPage />} />
              <Route path="/org/identities" element={<OrgIdentitiesPage />} />
              <Route path="/org/credentials" element={<OrgCredentialsPage />} />
              <Route path="/org/credentials/:id" element={<OrgCredentialDetailsPage />} />
              <Route path="/org/issue" element={<OrgIssueCredentialPage />} />
              <Route path="/org/activity" element={<OrgActivityPage />} />
              <Route path="/org/profile" element={<OrgProfilePage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['identity_manager']} />}>
              <Route path="/im/dashboard" element={<ImDashboard />} />
              <Route path="/im/citizens" element={<ImCitizensPage />} />
              <Route path="/im/citizens/:id" element={<ImCitizenDetailsPage />} />
              <Route path="/im/citizens/register" element={<ImRegisterCitizenPage />} />
              <Route path="/im/issue" element={<ImIssueCredentialPage />} />
              <Route path="/im/credentials" element={<ImCredentialsPage />} />
              <Route path="/im/credentials/:id" element={<ImCredentialDetailsPage />} />
              <Route path="/im/revocation" element={<ImRevocationPage />} />
              <Route path="/im/profile" element={<ImProfilePage />} />
              <Route path="/im/identities" element={<ImIdentitiesPage />} />
              <Route path="/im/identities/:id" element={<ImIdentityDetailsPage />} />
              <Route path="/im/create-identity" element={<ImCreateIdentityPage />} />
              <Route path="/im/review-queue" element={<ImReviewQueuePage />} />
              <Route path="/im/templates" element={<ImTemplatesPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['citizen']} />}>
              <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
              <Route path="/citizen/credential" element={<CitizenMyCredentialPage />} />
              <Route path="/citizen/credentials" element={<CitizenCredentialsPage />} />
              <Route path="/citizen/credentials/:id" element={<CitizenCredentialDetailsPage />} />
              <Route path="/citizen/presentations" element={<CitizenPresentationsPage />} />
              <Route path="/citizen/profile" element={<CitizenProfilePage />} />
              <Route path="/citizen/settings" element={<CitizenSettingsPage />} />
              <Route path="/citizen/verification-history" element={<CitizenVerificationHistoryPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['administrator']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/requests" element={<AdminOrgRequestsPage />} />
              <Route path="/admin/requests/:id" element={<AdminOrgRequestDetailsPage />} />
              <Route path="/admin/organizations" element={<AdminOrganizationsPage />} />
              <Route path="/admin/audit" element={<AdminAuditLogsPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/identity-managers" element={<Navigate to="/admin/users" replace />} />
              <Route path="/admin/credentials" element={<Navigate to="/admin/users" replace />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
              <Route path="/admin/system-status" element={<AdminSystemStatusPage />} />
              <Route path="/admin/api" element={<AdminApiDocsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
