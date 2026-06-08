# Project Folder Structure

```text
distributed-ticket-system/
├── client/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── assets/
│   │   │   ├── hero.png
│   │   │   ├── react.svg
│   │   │   └── vite.svg
│   │   ├── components/
│   │   │   ├── AuthLayout.jsx
│   │   │   ├── CustomToast.jsx
│   │   │   ├── InputField.jsx
│   │   │   ├── ProctectedRoute.jsx
│   │   │   ├── PublicRoute.jsx
│   │   │   ├── SeatMap.jsx
│   │   │   ├── ShareSeatCard.jsx
│   │   │   └── Signup.jsx
│   │   ├── config/
│   │   │   └── api.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useSeats.js
│   │   │   └── useShows.js
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── ShowDetail.jsx
│   │   │   ├── Shows.jsx
│   │   │   └── signup.jsx
│   │   ├── services/
│   │   │   ├── authServices.js
│   │   │   ├── seatService.js
│   │   │   ├── showService.js
│   │   │   └── venueService.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   ├── tailwind.config.js
│   └── vite.config.js
├── notes/
│   ├── 1.txt
│   ├── distributed_ticket_booking_roadmap (1).pdf
│   └── distributed_ticket_booking_roadmap.txt
├── scripts/
│   ├── createService.ts
│   └── removeService.ts
├── src/
│   ├── config/
│   │   ├── cookie.config.ts
│   │   ├── db.config.ts
│   │   ├── env.config.ts
│   │   ├── mail.ts
│   │   └── redis.config.ts
│   ├── middlewares/
│   │   ├── authenticate.middleware.ts
│   │   └── global.error.middleware.ts
│   ├── modules/
│   │   ├── booking/
│   │   │   ├── booking.controller.ts
│   │   │   ├── booking.dto.ts
│   │   │   ├── booking.enum.ts
│   │   │   ├── booking.interface.ts
│   │   │   ├── booking.model.ts
│   │   │   ├── booking.routes.ts
│   │   │   └── booking.service.ts
│   │   ├── seat/
│   │   │   ├── seat.controller.ts
│   │   │   ├── seat.dto.ts
│   │   │   ├── seat.enum.ts
│   │   │   ├── seat.interface.ts
│   │   │   ├── seat.model.ts
│   │   │   ├── seat.routes.ts
│   │   │   └── seat.service.ts
│   │   ├── show/
│   │   │   ├── show.controller.ts
│   │   │   ├── show.dto.ts
│   │   │   ├── show.enum.ts
│   │   │   ├── show.interface.ts
│   │   │   ├── show.model.ts
│   │   │   ├── show.routes.ts
│   │   │   └── show.service.ts
│   │   ├── user/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.dto.ts
│   │   │   ├── user.enum.ts
│   │   │   ├── user.interface.ts
│   │   │   ├── user.model.ts
│   │   │   ├── user.routes.ts
│   │   │   └── user.service.ts
│   │   └── venue/
│   │       ├── venue.controller.ts
│   │       ├── venue.dto.ts
│   │       ├── venue.enum.ts
│   │       ├── venue.interface.ts
│   │       ├── venue.model.ts
│   │       ├── venue.routes.ts
│   │       └── venue.service.ts
│   ├── shared/
│   │   ├── error/
│   │   │   └── custom.error.ts
│   │   └── service/
│   │       ├── mail.service.ts
│   │       └── otp.service.ts
│   ├── types/
│   │   └── express.d.ts
│   ├── utils/
│   │   ├── redis/
│   │   │   ├── redis.cache.ts
│   │   │   ├── redis.keys.ts
│   │   │   └── redis.lock.ts
│   │   ├── generate-otp.util.ts
│   │   ├── generate-token.util.ts
│   │   ├── logge.util.ts
│   │   ├── parse-duration.util.ts
│   │   └── query-builder.util.ts
│   ├── app.ts
│   └── server.ts
├── project_structure.md
├── package-lock.json
├── package.json
└── tsconfig.json
```
