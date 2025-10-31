package handler

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"net/mail"
	"net/smtp"
	"time"

	"api-fiber-gorm/config"
	"api-fiber-gorm/database"
	"api-fiber-gorm/model"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// CheckPasswordHash compare password with hash
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// getUserByEmail fetch user by email
func getUserByEmail(e string) (*model.User, error) {
	var user model.User
	if err := database.DB.Where("email = ?", e).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

// getUserByUsername fetch user by username
func getUserByUsername(u string) (*model.User, error) {
	var user model.User
	if err := database.DB.Where("username = ?", u).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

// isEmail validate email format
func isEmail(email string) bool {
	_, err := mail.ParseAddress(email)
	return err == nil
}

// Login handler
func Login(c *fiber.Ctx) error {
	type LoginInput struct {
		Identity string `json:"identity"` // username or email
		Password string `json:"password"`
	}

	input := new(LoginInput)
	if err := c.BodyParser(input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Invalid request body", "data": err.Error()})
	}

	// Get user
	var user *model.User
	var err error
	if isEmail(input.Identity) {
		user, err = getUserByEmail(input.Identity)
	} else {
		user, err = getUserByUsername(input.Identity)
	}

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Internal server error", "data": err.Error()})
	}
	if user == nil || !CheckPasswordHash(input.Password, user.Password) {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"status": "error", "message": "Invalid identity or password"})
	}

	// Generate JWT
	token := jwt.New(jwt.SigningMethodHS256)
	claims := token.Claims.(jwt.MapClaims)
	claims["user_id"] = user.ID
	claims["username"] = user.Username
	claims["role"] = user.Role
	claims["exp"] = time.Now().Add(72 * time.Hour).Unix()

	t, err := token.SignedString([]byte(config.Config("SECRET")))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Failed to generate token"})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Login successful", "data": t})
}

// GenerateVerificationToken generates a random token for email verification
func GenerateVerificationToken() (string, error) {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

// SendVerificationEmail sends verification email to user
func SendVerificationEmail(email, token string) error {
	// Konfigurasi SMTP
	smtpHost := config.Config("SMTP_HOST")
	smtpPort := config.Config("SMTP_PORT")
	smtpUser := config.Config("SMTP_USER")
	smtpPass := config.Config("SMTP_PASS")
	
	// Jika konfigurasi SMTP tidak lengkap, skip pengiriman email (untuk development)
	if smtpHost == "" || smtpPort == "" || smtpUser == "" || smtpPass == "" {
		fmt.Println("SMTP configuration incomplete, skipping email sending")
		return nil
	}

	// Alamat server SMTP
	addr := smtpHost + ":" + smtpPort

	// Autentikasi
	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)

	// Konten email
	verifyURL := config.Config("FRONTEND_URL") + "/auth/verify?token=" + token
	subject := "Verifikasi Email Loket App"
	body := fmt.Sprintf("Silakan klik link berikut untuk memverifikasi email Anda: %s", verifyURL)
	message := []byte("To: " + email + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"\r\n" +
		body + "\r\n")

	// Kirim email
	return smtp.SendMail(addr, auth, smtpUser, []string{email}, message)
}

// Register handler
func Register(c *fiber.Ctx) error {
	// Struktur input registrasi
	type RegisterInput struct {
		Username    string `json:"username"`
		Email       string `json:"email"`
		Password    string `json:"password"`
		FullName    string `json:"full_name"`
		PhoneNumber string `json:"phone_number"`
	}

	input := new(RegisterInput)
	if err := c.BodyParser(input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid request body",
			"data":    err.Error(),
		})
	}

	// Validasi input
	if input.Username == "" || input.Email == "" || input.Password == "" || input.FullName == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Username, email, password, and full name are required",
		})
	}

	// Validasi format email
	if !isEmail(input.Email) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Invalid email format",
		})
	}

	// Cek apakah username sudah digunakan
	existingUser, err := getUserByUsername(input.Username)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to check username",
			"data":    err.Error(),
		})
	}
	if existingUser != nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"status":  "error",
			"message": "Username already exists",
		})
	}

	// Cek apakah email sudah digunakan
	existingEmail, err := getUserByEmail(input.Email)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to check email",
			"data":    err.Error(),
		})
	}
	if existingEmail != nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"status":  "error",
			"message": "Email already exists",
		})
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to hash password",
			"data":    err.Error(),
		})
	}

	// Generate verification token
	verificationToken, err := GenerateVerificationToken()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to generate verification token",
			"data":    err.Error(),
		})
	}

	// Buat user baru
	user := model.User{
		Username:           input.Username,
		Email:              input.Email,
		Password:           string(hashedPassword),
		FullName:           input.FullName,
		PhoneNumber:        input.PhoneNumber,
		Role:               "customer", // Default role
		VerificationToken:  verificationToken,
		IsVerified:         false,
	}

	// Simpan user ke database
	if err := database.DB.Create(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to create user",
			"data":    err.Error(),
		})
	}

	// Kirim email verifikasi
	go SendVerificationEmail(user.Email, verificationToken)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"status":  "success",
		"message": "User registered successfully. Please check your email for verification.",
		"data": fiber.Map{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
		},
	})
}

// VerifyEmail handler
func VerifyEmail(c *fiber.Ctx) error {
	token := c.Query("token")
	if token == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Verification token is required",
		})
	}

	// Cari user dengan token verifikasi
	var user model.User
	if err := database.DB.Where("verification_token = ?", token).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"status":  "error",
				"message": "Invalid verification token",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to verify email",
			"data":    err.Error(),
		})
	}

	// Update status verifikasi email
	user.IsVerified = true
	user.VerificationToken = "" // Hapus token setelah digunakan
	verifiedTime := time.Now()
	user.VerifiedAt = &verifiedTime
	if err := database.DB.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Failed to update user verification status",
			"data":    err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Email verified successfully",
	})
}
