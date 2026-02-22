from django.urls import path

from . import views

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="register"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("token/refresh/", views.RefreshTokenView.as_view(), name="token_refresh"),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    path("profile/", views.ProfileView.as_view(), name="profile"),
    path("password/change/", views.ChangePasswordView.as_view(), name="change_password"),
    path("profile/delete/", views.DeleteAccountView.as_view(), name="delete_account"),
    # Admin
    path("admin/users/", views.AdminUserListView.as_view(), name="admin_users"),
    path("admin/users/<uuid:pk>/", views.AdminUserDetailView.as_view(), name="admin_user_detail"),
]
