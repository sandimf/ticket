package router

import (
	"api-fiber-gorm/handler"
	"api-fiber-gorm/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func SetupRoutes(app *fiber.App) {
	// Middleware
	app.Get("/", handler.Hello)

	
	api := app.Group("/api", logger.New())
	api.Get("/", handler.Hello)

	// Auth
	auth := api.Group("/auth")
	auth.Post("/login", handler.Login)
	auth.Post("/register", handler.CreateUser)
	auth.Get("/verify", handler.VerifyEmail)

	// User
	user := api.Group("/user")
	user.Get("/list", handler.GetAllUsers)
	user.Get("/:id", handler.GetUser)
	user.Post("/", handler.CreateUser)
	user.Patch("/:id", middleware.Protected(), handler.UpdateUser)
	user.Delete("/:id", middleware.Protected(), handler.DeleteUser)

	// Event
	event := api.Group("/event")
	event.Get("/", handler.GetAllEvents)
	event.Get("/slug/:slug", handler.GetEventBySlug)
	event.Post("/", middleware.Protected(), handler.CreateEvent)
	event.Patch("/:id", middleware.Protected(), handler.UpdateEvent)
	event.Patch("/:id/featured", middleware.Protected(), handler.ToggleEventFeatured)
	event.Delete("/:id", middleware.Protected(), handler.DeleteEvent)

	// TicketType
	tt := api.Group("/ticket-type")
	tt.Get("/", handler.GetAllTicketTypes)
	tt.Get("/:id", handler.GetTicketType)
	tt.Get("/event/:event_id", handler.GetTicketTypesForEvent)
	tt.Post("/", middleware.Protected(), handler.CreateTicketType)
	tt.Patch("/:id", middleware.Protected(), handler.UpdateTicketType)
	tt.Delete("/:id", middleware.Protected(), handler.DeleteTicketType)

	// Order
	order := api.Group("/order")
	order.Get("/", handler.GetAllOrders)
	order.Get("/:id", handler.GetOrder)
	order.Get("/user/:user_id", handler.GetOrdersForUser)
	// Guest order allowed: remove Protected()
	order.Post("/", handler.CreateOrder)
	order.Patch("/:id/status", middleware.Protected(), handler.UpdateOrderStatus)
	// Allow uploading payment proof without auth; accept guest details
	order.Post("/:id/payment-proof", handler.UploadPaymentProof)
	order.Delete("/:id", middleware.Protected(), handler.DeleteOrder)
	// Tambah route berbasis invoice
	order.Get("/invoice/:invoice", handler.GetOrderByInvoice)
	order.Patch("/invoice/:invoice/status", middleware.Protected(), handler.UpdateOrderStatusByInvoice)
	order.Post("/invoice/:invoice/payment-proof", handler.UploadPaymentProofByInvoice)

	// Banner
	banner := api.Group("/banner")
	banner.Get("/", handler.GetAllBanners)
	banner.Post("/", middleware.Protected(), handler.CreateBanner)
	banner.Patch("/:id", middleware.Protected(), handler.UpdateBanner)
	banner.Delete("/:id", middleware.Protected(), handler.DeleteBanner)

	// IssuedTicket
	issued := api.Group("/issued-ticket")
	issued.Get("/:id", handler.GetIssuedTicket)
	issued.Get("/order/:order_id", handler.GetTicketsForOrder)
	issued.Get("/user/:user_id", handler.GetTicketsForUser)
	issued.Post("/checkin/:ticket_code", middleware.Protected(), handler.CheckInTicket)
	issued.Delete("/:id", middleware.Protected(), handler.DeleteIssuedTicket)
}
