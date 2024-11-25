const { PrismaClient} = require('@prisma/client')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const {createJSONToken} = require("../utils/auth");

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET

const signup = async (req, res) => {
    const {
        email,
        name,
        password,
        confirmPassword
    } = req.body;

    console.log(email, name, password, confirmPassword)

    try{
        if (!email || !name || !password || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match.' });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser ) {
            return res.status(400).json({ message: 'User  already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
            }
        })

        res.status(200).json({ message: 'User created.' });
    } catch (error) {
        console.error('Error while signing up user:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}

const login = async (req, res) => {
    console.log(req.body)
    const {
        email,
        password
    } = req.body;

    try {

        if(!email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if(!user || !(await bcrypt.compare(password, user.password))){
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const token = createJSONToken(user.id, user.email);

        res.json({ token });
    } catch (error) {
        console.error('Error while logging in user:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}

module.exports = { signup, login }