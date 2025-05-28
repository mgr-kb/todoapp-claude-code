model Todo {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  title       String
  description String
  dueDate     DateTime @db.Date
  priority    Int
  completed   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
model User {
  id        String   @id
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
