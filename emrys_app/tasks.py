import frappe
from frappe.utils import get_url
from frappe.utils import getdate, add_days, add_months, today



def duplicate_project():
    project_details= frappe.db.get_all("Project Details",filters = {"completed":0,"end_date":["<",getdate(today())]},fields = ["name","parent","project","end_date"])
    for pro in project_details:
        repetition_period = frappe.db.get_value("Project",pro.project,"custom_repetition_period")
        end_date = None
                    
        # Calculate the new end date based on repetition period
        if repetition_period == "Quarterly":
            end_date = add_months(add_days(pro.end_date, 1), 3)
        elif repetition_period == "Monthly":
            end_date = add_months(add_days(pro.end_date, 1), 1)
        elif repetition_period == "Weekly":
            end_date = add_days(pro.end_date, 8)
        elif repetition_period == "Daily":
            end_date = add_days(pro.end_date, 2)
        # If end_date is still None, throw an error
        if not end_date:
            return


        original = frappe.get_doc("Project", pro.project)

        new_project = frappe.copy_doc(original)
        new_project.insert(ignore_permissions=True)
        # Mark original project as completed
        create_todo(original.name)
        frappe.db.set_value("Project Details",pro.name,"completed",1)

        customer = frappe.get_doc("Customer",pro.parent)
        # Append new project details
        customer.append("custom_project_details", {
            "project": new_project.name,
            "start_date": add_days(pro.end_date, 1),
            "end_date": add_days(end_date, -1)
        })
        customer.save()





@frappe.whitelist()
def send_email(recipient,task_name, subject, description, attachment=None):
    # Fetch the project document
    task = frappe.get_doc("Task", task_name)
    
    # Define recipient email (e.g., Project Owner or any specific user)
    recipient = recipient  # Modify this to the recipient you want
    
    # Compose the email body
    body = f"<p>{description}</p><p>Project: {task.subject}</p>"
    
    # If attachment is provided, store it
    attachments = []
    if attachment:
        attachment_url = get_url(attachment)
        attachments.append(attachment_url)
    
    # Send the email using frappe.send_mail
    frappe.sendmail(
        recipients=[recipient],
        subject=subject,
        message=body,
        attachments=attachments,
        send_after=frappe.utils.now()  # Optional, send immediately
    )
    
    frappe.msgprint(f"Email sent successfully to {recipient}.")



def create_todo(original):
    tasks = frappe.db.get_all("Task",{"project":original})
    for task in tasks:
        if frappe.db.exists("ToDo",{"reference_name":task.name}):
            to_do = frappe.get_doc("ToDo",{"reference_name":task.name})
            new_todo = frappe.copy_doc(to_do)
            new_todo.insert()