import z from "zod"

// Register
const registerUserSchema = z.object({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(50),

  email: z.string().trim().email('Invalid email format'),

  password:  z.string().trim()
        .min(8, "New password must be at least 8 characters")
        .max(100, "Password too long")
        .regex(/[A-Za-z]/, "Must contain letters")
        .regex(/[0-9]/, "Must contain numbers")
        .regex(/[^A-Za-z0-9]/, "Must contain special character"),

  role: z.enum(['student', 'admin', 'faculty']).optional(),

  registrationNumber : z.string().trim().optional(),

  mobile: z.string().trim().min(10).max(10)
});

// Login
const loginUserSchema = z.object({
  email: z.string().trim().email('Invalid email format'),
  password: z.string().trim().min(1)
});


// Update
const updateUserSchema = z.object({
    fullName: z.string().trim().min(2, "Name must be 2+ characters").max(50).optional(),
    email: z.string().trim().email("Invalid email").optional(),
    mobile: z.string().trim().min(10, "Mobile must be 10+ digits").max(15).optional(),
    registrationNumber: z.string().trim().min(5, "Registration number required").optional(),
    role: z.enum(['student', 'admin', 'faculty']).optional()
}); // Allow extra fields if needed


const changePasswordSchema = z.object({
    oldPassword: z.string().trim()
        .min(1, "Current password is required")
        .max(100, "Password too long"),
    newPassword: z.string().trim()
        .min(8, "New password must be at least 8 characters")
        .max(100, "Password too long")
        .regex(/[A-Za-z]/, "Must contain letters")
        .regex(/[0-9]/, "Must contain numbers")
        .regex(/[^A-Za-z0-9]/, "Must contain special character")
})
.refine((data) => data.newPassword !== data.oldPassword, {
    message: "New password cannot be same as old password",
    path: ["newPassword"]
});


export {
  registerUserSchema, 
  loginUserSchema,
  updateUserSchema,
  changePasswordSchema
}


