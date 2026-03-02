
import tkinter as tk
from tkinter import messagebox
from PIL import Image, ImageTk
import os
import coffee_database

class LoginWindow:
    def __init__(self, root, on_success_callback):
        self.root = root
        self.root.title("Roast & Revel - Login")
        self.root.geometry("400x700")  # Mobile-like aspect ratio
        self.root.resizable(False, False)
        
        self.on_success = on_success_callback
        
        # Database connection
        self.db = coffee_database.CoffeeDatabase()
        self.db.connect()
        self.db.create_tables() # Ensure user table exists
        
        # UI Setup
        self.setup_ui()
        
    def setup_ui(self):
        # Background Image
        bg_path = "login_design.jpg"
        if os.path.exists(bg_path):
            original_image = Image.open(bg_path)
            resized_image = original_image.resize((400, 700), Image.Resampling.LANCZOS)
            self.bg_photo = ImageTk.PhotoImage(resized_image)
            
            self.bg_label = tk.Label(self.root, image=self.bg_photo)
            self.bg_label.place(x=0, y=0, relwidth=1, relheight=1)
        else:
            self.root.configure(bg="#4b3621") # Fallback coffee color
            
        # Buttons (Placed approximately matching the design)
        # Using exact coordinates based on the design's layout
        
        # Login Button
        self.btn_login = tk.Button(self.root, text="Log in", font=("Arial", 14, "bold"),
                                   bg="white", fg="black", activebackground="#f0f0f0",
                                   relief="flat", borderwidth=0,
                                   command=self.show_login_dialog)
        self.btn_login.place(relx=0.5, rely=0.82, width=200, height=45, anchor="center")
        
        # Sign Up Button
        self.btn_signup = tk.Button(self.root, text="Sign up", font=("Arial", 14, "bold"),
                                    bg="white", fg="black", activebackground="#f0f0f0",
                                    relief="flat", borderwidth=0,
                                    command=self.show_signup_dialog)
        self.btn_signup.place(relx=0.5, rely=0.74, width=200, height=45, anchor="center")
        
        # Style the buttons to look rounded (simulated with standard options or basic style)
        # Tkinter native buttons are rectangular. To get rounded, valid images would be better
        # For this implementation, we stick to standard buttons but styled cleanly.
        
    def show_login_dialog(self):
        LoginDialog(self.root, self.db, self.on_login_success)

    def show_signup_dialog(self):
        SignupDialog(self.root, self.db)

    def on_login_success(self):
        self.db.close()
        self.root.destroy()
        self.on_success()

class CustomDialog(tk.Toplevel):
    def __init__(self, parent, title):
        super().__init__(parent)
        self.title(title)
        self.geometry("300x250")
        self.resizable(False, False)
        self.configure(bg="#f8f1e5")
        
        # Center the dialog
        x = parent.winfo_x() + (parent.winfo_width() // 2) - 150
        y = parent.winfo_y() + (parent.winfo_height() // 2) - 125
        self.geometry(f"+{x}+{y}")
        
        self.setup_content()
        self.transient(parent)
        self.grab_set()
        self.focus_set()

    def setup_content(self):
        pass

class LoginDialog(CustomDialog):
    def __init__(self, parent, db, success_callback):
        self.db = db
        self.success_callback = success_callback
        super().__init__(parent, "Log In")
        
    def setup_content(self):
        tk.Label(self, text="Username:", bg="#f8f1e5", font=("Arial", 10)).pack(pady=(20, 5))
        self.entry_user = tk.Entry(self, font=("Arial", 10))
        self.entry_user.pack(pady=5)
        
        tk.Label(self, text="Password:", bg="#f8f1e5", font=("Arial", 10)).pack(pady=5)
        self.entry_pass = tk.Entry(self, show="*", font=("Arial", 10))
        self.entry_pass.pack(pady=5)
        
        tk.Button(self, text="Log In", bg="#6F4E37", fg="white", font=("Arial", 10, "bold"),
                  command=self.login).pack(pady=20, ipadx=20)
                  
    def login(self):
        username = self.entry_user.get()
        password = self.entry_pass.get()
        
        if self.db.verify_user(username, password):
            self.success_callback()
        else:
            messagebox.showerror("Error", "Invalid username or password", parent=self)

class SignupDialog(CustomDialog):
    def __init__(self, parent, db):
        self.db = db
        super().__init__(parent, "Sign Up")
        
    def setup_content(self):
        tk.Label(self, text="Choose Username:", bg="#f8f1e5", font=("Arial", 10)).pack(pady=(20, 5))
        self.entry_user = tk.Entry(self, font=("Arial", 10))
        self.entry_user.pack(pady=5)
        
        tk.Label(self, text="Choose Password:", bg="#f8f1e5", font=("Arial", 10)).pack(pady=5)
        self.entry_pass = tk.Entry(self, show="*", font=("Arial", 10))
        self.entry_pass.pack(pady=5)
        
        tk.Button(self, text="Sign Up", bg="#6F4E37", fg="white", font=("Arial", 10, "bold"),
                  command=self.signup).pack(pady=20, ipadx=20)
                  
    def signup(self):
        username = self.entry_user.get()
        password = self.entry_pass.get()
        
        if not username or not password:
             messagebox.showerror("Error", "All fields are required", parent=self)
             return

        if self.db.add_user(username, password):
            messagebox.showinfo("Success", "Account created! Please log in.", parent=self)
            self.destroy()
        else:
            messagebox.showerror("Error", "Username already taken", parent=self)
