import { NextResponse } from 'next/server'
import bcryptjs from 'bcryptjs'

import { connectToDatabase } from '@/lib/mongodb'
import User from '@/lib/models/user'

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    // --- Validation ---
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      )
    }

    const trimmedEmail = email.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters.' },
        { status: 400 }
      )
    }

    // --- Connect to database ---
    await connectToDatabase()

    // --- Check if user already exists ---
    const existingUser = await User.findOne({ email: trimmedEmail })
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      )
    }

    // --- Hash the password ---
    const hashedPassword = await bcryptjs.hash(password, 12)

    // --- Create the user ---
    await User.create({
      name: name?.trim() || '',
      email: trimmedEmail,
      password: hashedPassword,
    })

    return NextResponse.json(
      { message: 'Account created successfully.' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
