import { createI18n } from 'vue-i18n'

const messages = {
  id: {
    // Login
    login_title: 'Masuk',
    login_subtitle: 'Masuk ke akun Napza Edu Card kamu',
    email_label: 'Email',
    email_placeholder: 'Masukkan email kamu',
    password_label: 'Password',
    password_placeholder: 'Masukkan password kamu',
    login_button: 'Masuk',
    no_account_text: 'Belum punya akun?',
    register_link: 'Daftar Sekarang',
    back_button: 'Kembali',

    // Login messages
    login_success: 'Selamat datang, {name}!',
    login_error_empty: 'Email dan password harus diisi.',
    login_error_invalid_email: 'Format email tidak valid.',
    login_error_wrong_password: 'Password salah.',
    login_error_not_found: 'Email tidak ditemukan.',
    login_error_server: 'Terjadi kesalahan server. Silakan coba lagi.',
    register_success: 'Registrasi berhasil! Silakan login.',

    // Validation
    validation_required: '{field} harus diisi.',
    validation_email: 'Format email tidak valid.',
    validation_min_length: '{field} minimal {min} karakter.',

    // General
    app_title: 'NAPZA EDU CARD',
    loading: 'Memuat...',
  },
  en: {
    // Login
    login_title: 'Login',
    login_subtitle: 'Sign in to your Napza Edu Card account',
    email_label: 'Email',
    email_placeholder: 'Enter your email',
    password_label: 'Password',
    password_placeholder: 'Enter your password',
    login_button: 'Login',
    no_account_text: "Don't have an account?",
    register_link: 'Register Now',
    back_button: 'Back',

    // Login messages
    login_success: 'Welcome, {name}!',
    login_error_empty: 'Email and password are required.',
    login_error_invalid_email: 'Invalid email format.',
    login_error_wrong_password: 'Wrong password.',
    login_error_not_found: 'Email not found.',
    login_error_server: 'Server error. Please try again.',
    register_success: 'Registration successful! Please login.',

    // Validation
    validation_required: '{field} is required.',
    validation_email: 'Invalid email format.',
    validation_min_length: '{field} must be at least {min} characters.',

    // General
    app_title: 'NAPZA EDU CARD',
    loading: 'Loading...',
  },
}

export default createI18n({
  legacy: false,
  locale: 'id',
  fallbackLocale: 'en',
  messages,
})
