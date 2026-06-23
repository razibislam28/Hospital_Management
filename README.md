# Hospital Management Database Project

An optimized relational database schema designed for managing hospital operations, tracking doctor performance, pharmacy inventory reorder alerts, and monthly department financial reporting.

## 1. Setup & Installation Instructions

### Prerequisites
* **XAMPP** (with Apache and MySQL/MariaDB modules enabled)
* A web browser to access **phpMyAdmin**

### Environment Configuration
Use these default XAMPP connection parameters:
* **DB_HOST**: `localhost` (or `127.0.0.1`)
* **DB_USER**: `root`
* **DB_PASS**: `""` (Leave blank)
* **DB_NAME**: `hospital_management`
* **DB_PORT**: `3306`

### Run Database Migrations & Start Server
1. Open XAMPP Control Panel and start **Apache** and **MySQL**.
2. Go to `http://localhost/phpmyadmin` in your web browser.
3. Click **New** in the left sidebar, name the database `hospital_management`, and click **Create**.
4. Select your new database, click the **Import** tab at the top, choose your `schema.sql` file, and click **Go**.
5. Once complete, all 7 tables and optimized indexes are fully active on your local MySQL server.

---

## 2. Completed vs. Incomplete Tasks

* **Completed (Tasks 01–10):** All database tasks are fully done. This includes writing the complete `schema.sql` with exact `DECIMAL` types for money, configuring explicit foreign key rules (`CASCADE`/`RESTRICT`), implementing 7 optimized indexes with justification comments, applying `ENUM` types for fixed fields, adding soft-delete columns, and drafting all 5 analytical reporting queries.
Sever.js is the REST API Design and Build. The justification comments are complete

* **Incomplete ( Frontend UI)  Frontend Dashboard UI was completely missed/forgotten due to tight time-tracking constraints, as the entire focus was placed on perfecting the core relational database structure.

---

## 3. Key Decisions & Trade-Offs Under Time Pressure

* **Deletion Constraints:** Under strict time pressure, `ON DELETE CASCADE` was used for `patients` to cleanly wipe their appointments automatically. However, `ON DELETE RESTRICT` was hard-coded onto `doctors` and `medicines`. This requires slightly more manual data administration if records change, but it fully prevents accidental deletion or corruption of historical financial data in the invoice ledger.
* **On-the-Fly Analytics:** Instead of spending time designing a complex separate accounting ledger schema, the monthly revenue calculations are handled entirely via dynamic SQL joins against the `invoices` table. This drastically reduced design time while staying highly performant via targeted timestamp indexes.

---

## 4. Future Improvement Given Another 2 Hours

If given an extra 2 hours, the immediate priority would be adding **Database Triggers for Pharmacy Inventory Automation**. Creating an `AFTER INSERT` trigger on the `prescriptions` table would automatically deduct the dispensed medication dosage directly from `medicines.stock_quantity`. This eliminates reliance on an application layer, blocks human data-entry errors, and provides instant, accurate data for the low stock reorder alert query.
