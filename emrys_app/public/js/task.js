frappe.ui.form.on('Task', {
    refresh: function(frm) {
        frm.add_custom_button(__('Send Email'), function() {
            // Open the popup when button is clicked
            show_email_popup(frm);
        });
    }
});



function show_email_popup(frm) {
    const dialog = new frappe.ui.Dialog({
        title: 'Send Email',
        fields: [
            {
                label: 'Recipient',
                fieldname: 'recipient',
                fieldtype: 'Link',
                options: 'User',  // Link to User doctype
                reqd: 1,
                placeholder: 'Select recipient from Users'
            },
            {
                label: 'Subject',
                fieldname: 'subject',
                fieldtype: 'Data',
                reqd: 1
            },
            {
                label: 'Description',
                fieldname: 'description',
                fieldtype: 'Text',
                reqd: 1
            },
            {
                label: 'Attachment',
                fieldname: 'attachment',
                fieldtype: 'Attach',
            },
        ],
        primary_action_label: 'Send',
        primary_action: function() {
            const data = dialog.get_values();
            
            // Check if subject and description are filled
            if (!data.subject || !data.description) {
                frappe.msgprint('Subject and Description are required.');
                return;
            }
            
            // Call server-side function to send the email
            send_email(data.recipient,frm.doc.name, data.subject, data.description, data.attachment);
            dialog.hide();
        }
    });

    dialog.show();
}


function send_email(recipient,task_name, subject, description, attachment) {
    console.log(task_name,111111)
    frappe.call({
        method: 'emrys_app.tasks.send_email',  // Your Python method path
        args: {
            task_name: task_name,
            subject: subject,
            description: description,
            attachment: attachment,
            recipient:recipient
        },
        callback: function(response) {
            frappe.msgprint(__('Email sent successfully.'));
        },
        error: function(error) {
            frappe.msgprint(__('Failed to send email.'));
        }
    });
}