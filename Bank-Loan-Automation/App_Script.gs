

function sendEmail(data) {
  var recipient = data.email;
  var subject = 'Prediction Result';
  var templateDocId = 'here'; // Replace with your template document's ID
  var folderId = 'here'; // Replace with the folder's ID

  // Log debugging information
  console.log('Recipient: ' + recipient);
  console.log('Subject: ' + subject);

  // Create a new copy of the template document in the specified folder
  var folder = DriveApp.getFolderById(folderId);
  var templateDoc = DriveApp.getFileById(templateDocId);
  var newDoc = templateDoc.makeCopy('Generated Document', folder);

  // Access the body of the new document
  var body = DocumentApp.openById(newDoc.getId()).getBody();

  // Replace placeholders in the document with form data
  body.replaceText('{{Input Field 1}}', data.application_number);
  body.replaceText('{{Input Field 2}}', data.name);
  body.replaceText('{{Input Field 3}}', data.gender);
  body.replaceText('{{Input Field 4}}', data.married);
  body.replaceText('{{Input Field 5}}', data.dependents);
  body.replaceText('{{Input Field 6}}', data.education);
  body.replaceText('{{Input Field 7}}', data.self_employed);
  body.replaceText('{{Input Field 8}}', data.applicant_income);
  body.replaceText('{{Input Field 9}}', data.coapplicant_income);
  body.replaceText('{{Input Field 10}}', data.loan_amount);
  body.replaceText('{{Input Field 11}}', data.loan_term);
  body.replaceText('{{Input Field 12}}', data.credit_history);
  // Add more placeholders and replacements for additional fields

  // Log debugging information
  console.log('Document ID: ' + newDoc.getId());

  // Save the changes to the document
  DocumentApp.openById(newDoc.getId()).saveAndClose();

  // Convert the new document to PDF
  var pdfBlob = DriveApp.getFileById(newDoc.getId()).getAs('application/pdf');

  // Log debugging information
  console.log('PDF Blob: ' + pdfBlob);

  // Close the new document to save changes
  newDoc.setTrashed(true);

  // Create the HTML email body
  var emailBody = `
    <html>
    <head>
      <style>
        /* Add your CSS styling here */
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 5px;
          box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #3498db;
        }
        p {
          color: #333333;
          line-height: 1.6;
        }
        .footer {
          margin-top: 20px;
          color: #777777;
        }
        /* Add your CSS styles here */
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Prediction Result</h1>
        <p><strong>Applicantion number:</strong> ${data.application_number}</p>
        <p><strong>Name:</strong> ${data.name}</p>
      </div>
    </body>
    </html>
  `;

  // Log debugging information
  console.log('Email Body: ' + emailBody);

  // Send the email with HTML content and attach the PDF
  MailApp.sendEmail({
    to: recipient,
    subject: subject,
    htmlBody: emailBody,
    attachments: [pdfBlob]
  });

  // Return a success response
  return ContentService.createTextOutput('Email sent successfully');
}

// This function is the entry point for the web app
function doPost(e) {
  var formData = e.parameter;
  return sendEmail(formData);
}
