import unittest

from app.schemas.user import UserCreate, UserLogin


class UserAuthValidationTests(unittest.TestCase):
    def test_signup_password_validates_strength(self):
        user = UserCreate(email='user@example.com', password='Secure123')
        self.assertEqual(user.email, 'user@example.com')
        self.assertTrue(len(user.password) >= 8)

    def test_signup_password_rejects_weak_value(self):
        with self.assertRaises(ValueError):
            UserCreate(email='user@example.com', password='weak')

    def test_login_requires_email_and_password(self):
        payload = UserLogin(email='user@example.com', password='Secure123')
        self.assertEqual(payload.email, 'user@example.com')


if __name__ == '__main__':
    unittest.main()
