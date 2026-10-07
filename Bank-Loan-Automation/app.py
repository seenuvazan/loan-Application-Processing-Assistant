from flask import Flask, render_template, request, redirect
from flask_sqlalchemy import SQLAlchemy
import joblib
import numpy as np
import uuid
import requests


# Load the trained machine learning model
model = joblib.load('model1.pkl')

# Initialize 
app = Flask(__name__)

# SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///loan_applications.db'

# SQLAlchemy instance
db = SQLAlchemy(app)


# Define loan application model
class LoanApplication(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    application_number = db.Column(db.String(36), unique=True, nullable=False)
    name = db.Column(db.String(255), nullable=False)
    email=db.Column(db.String(255),nullable=False)
    gender = db.Column(db.String(255), nullable=False)
    married = db.Column(db.String(255), nullable=False)
    dependents = db.Column(db.Integer, nullable=False)
    education = db.Column(db.String(255), nullable=False)
    self_employed = db.Column(db.String(255), nullable=False)
    applicant_income=db.Column(db.Integer, nullable=False)
    coapplicant_income=db.Column(db.Float,nullable=False)
    loan_amount=db.Column(db.Float,nullable=False)
    loan_term=db.Column(db.Float,nullable=False)
    credit_history=db.Column(db.String(255),nullable=False)
    property_area=db.Column(db.String(255),nullable=False)

    def __init__(self, application_number, name,email,gender,married,dependents,education,self_employed,applicat_income,coapplicant_income,loan_amount,loan_term,credit_history,property_area):
        self.application_number = application_number
        self.name = name
        self.email = email
        self.gender = gender
        self.married = married
        self.dependents= dependents
        self.education=education
        self.self_employed=self_employed
        self.applicant_income=applicat_income
        self.coapplicant_income=coapplicant_income
        self.loan_amount=loan_amount
        self.loan_term=loan_term
        self.credit_history=credit_history
        self.property_area=property_area

# Create loan_applications table if it doesn't exist
with app.app_context():
    db.create_all()

# home page route
@app.route('/')
def home():
    return render_template('home.html')

@app.route('/form')
def data_submission():
    return render_template('form.html')

@app.route('/emi')
def emi_calc():
    return render_template('emi_calculator.html')

# Define a route for form submission
@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Retrieve form data
        name = request.form['name']
        email = request.form['email']
        gender = request.form['gender']
        married = request.form['married']
        dependents = int(request.form['dependents'])
        education = request.form['education']
        self_employed = request.form['self_employed']
        applicant_income = int(request.form['applicant-income'])
        coapplicant_income = float(request.form['coapplicant_income'])
        loan_amount = float(request.form['loan_amount'])
        loan_term = float(request.form['loan_term'])
        credit_history = request.form['credit_history']
        property_area = request.form['property_area']

        print(name)
        print(email)

        if gender == 'Male':
            g_val=1
        else:
            g_val=0
        
        if married == 'Yes':
            mar_val=1
        else:
            mar_val=0
        
        if self_employed == 'Yes':
            se_val=1
        else:
            se_val=0

        if education == 'Graduate':
            e_val=1
        else:
            e_val=0

        if property_area == 'Rural':
            pa_val=0
        elif property_area == 'Semi Urban':
            pa_val=1
        else:
            pa_val=2
        
        if credit_history=='Yes':
            ch_val=1.0
        else:
            ch_val=0.0

        # Make prediction using the machine learning model
        input_data = (g_val, mar_val, dependents, e_val, se_val, applicant_income, coapplicant_income, loan_amount, loan_term, ch_val, pa_val)

        input_data_as_numpy_array = np.asarray(input_data)  # Changing the input_data to a numpy array

        input_data_reshaped = input_data_as_numpy_array.reshape(1, -1)  # Reshape the array

        prediction = model.predict(input_data_reshaped)

        if prediction[0] == 0:
            return render_template('success.html', prediction="Rejected", name=name)
        else:
            # Generate a UUID for the loan application
            application_number = str(uuid.uuid4())

            data = {
                'application_number': application_number,
                'name': name,
                'email': email,
                'gender': gender,
                'married': married,
                'dependents': dependents,
                'education': education,
                'self_employed': self_employed,
                'applicant_income': applicant_income,
                'coapplicant_income': coapplicant_income,
                'loan_amount': loan_amount,
                'loan_term': loan_term,
                'credit_history': credit_history
            }

            # print(data)
            response = requests.post('https://.google.com',data=data)

            # Store the data in the database
            save_loan_application(application_number, name, email, gender, married, dependents, education, self_employed, applicant_income, coapplicant_income, loan_amount, loan_term, credit_history, property_area)

            return render_template('success.html', prediction="Accepted", application_number=application_number, name=name)

    except (KeyError, ValueError) as e:
        error_message = str(e)
        return render_template('error.html', error_message=error_message)

    except Exception as e:
        error_message = "An error occurred while processing your request."
        # debugging purposes
        print("Error:", str(e))
        return render_template('error.html', error_message=error_message)


# Save the loan application data to the database and return the application number
def save_loan_application(application_number,name,email,gender,married,dependents,education,self_employed,applicant_income,coapplicant_income,loan_amount,loan_term,credit_history,property_area):

    # Create a new LoanApplication object
    loan_application = LoanApplication(application_number=application_number, name=name, email=email,gender=gender,married=married,dependents=dependents,education=education,self_employed=self_employed,applicat_income=applicant_income,coapplicant_income=coapplicant_income,loan_amount=loan_amount,loan_term=loan_term,credit_history=credit_history,property_area=property_area)

    # Add the loan application to the database session
    db.session.add(loan_application)

    # Commit the changes to the database
    db.session.commit()

    return application_number


# Define a route for authentication
@app.route('/auth', methods=['GET', 'POST'])
def auth():
    if request.method == "POST":
        password = request.form['password']
        if password == 'secret':  # Replace 'your_password' with the actual password
            print(password)
            return redirect('/data')
        else:
            error_message = "Invalid password. Access denied."
            return render_template('auth.html', error_message=error_message)
    return render_template('auth.html')

# Define a route to display all loan application data
@app.route('/data', methods=['GET','POST'])
def data():
    loan_applications = LoanApplication.query.all()
    return render_template('applications.html', loan_applications=loan_applications)


# 404 errors
@app.errorhandler(404)
def not_found_error(error):
    return render_template('error.html', error_message='Page not found'), 404

# 500 errors
@app.errorhandler(500)
def internal_error(error):
    # debugging purposes
    print("Error:", str(error))
    return render_template('error.html', error_message='Internal server error'), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
