frappe.ui.form.on('Project Details', {
    start_date: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        
        // Fetch the repetition period from the Project doc
        frappe.db.get_value("Project", row.project, "custom_repetition_period")
            .then((response) => {
                let repetition_period = response.message.custom_repetition_period;
                
                // Calculate the end date based on repetition period
                let start_date = row.start_date;
                let end_date = calculate_end_date(start_date, repetition_period);

                // Subtract 1 day from the calculated end date
                end_date = frappe.datetime.add_days(end_date, -1);

                // Set the end date on the row
                frappe.model.set_value(cdt, cdn, 'end_date', end_date);
            });
    }
});

// Function to calculate the end date based on repetition period
function calculate_end_date(start_date, repetition_period) {
    let end_date = null;

    switch (repetition_period) {
        case "Quarterly":
            end_date = frappe.datetime.add_months(start_date, 3); // Add 3 months
            break;
        case "Monthly":
            end_date = frappe.datetime.add_months(start_date, 1); // Add 1 month
            break;
        case "Weekly":
            end_date = frappe.datetime.add_days(start_date, 7); // Add 7 days
            break;
        case "Daily":
            end_date = frappe.datetime.add_days(start_date, 1); // Add 1 day
            break;
        default:
            break;
    }

    return end_date;
}
