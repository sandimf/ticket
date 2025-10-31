package handler

import (
	"fmt"
	"net/smtp"

	"api-fiber-gorm/config"
)

// sendVerificationEmail sends a verification email with a tokenized link
func sendVerificationEmail(toEmail, fullName, token string) error {
	host := config.Config("SMTP_HOST")
	port := config.Config("SMTP_PORT")
	user := config.Config("SMTP_USER")
	pass := config.Config("SMTP_PASS")
	from := config.Config("SMTP_FROM")
	if from == "" {
		from = user
	}

	baseURL := config.Config("APP_BASE_URL")
	if baseURL == "" {
		baseURL = "http://localhost:5000"
	}

	verifyURL := fmt.Sprintf("%s/api/auth/verify?token=%s", baseURL, token)

	subject := "Verify your email"
	body := fmt.Sprintf("Hi %s,\n\nPlease verify your email by clicking this link:\n%s\n\nIf you didn't create an account, please ignore this email.\n\nThanks.", fullName, verifyURL)

	// RFC 5322 formatted message
	msg := "From: " + from + "\r\n" +
		"To: " + toEmail + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"MIME-Version: 1.0\r\n" +
		"Content-Type: text/plain; charset=\"utf-8\"\r\n" +
		"\r\n" + body

	addr := fmt.Sprintf("%s:%s", host, port)
	auth := smtp.PlainAuth("", user, pass, host)
	return smtp.SendMail(addr, auth, from, []string{toEmail}, []byte(msg))
}