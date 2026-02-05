/*
 * Pilot Extension: Expense Report
 * Module ID: ExpenseReport
 * Features:
 * - Dynamic rows (add/delete)
 * - Tax/VAT per row
 * - Currency handling
 * - Grand total calculation
 * - Export to CSV
 */

xdefine(["xComponent"], function (xComponent) {
    "use strict";

    return xComponent.extend({
        id: "ExpenseReport",
        title: "Expense Report",
        icon: "fa fa-file-invoice-dollar",

        initModule: function () {
            this.addNavigation({
                id: "expense-report",
                title: "Expenses",
                icon: "fa fa-file-invoice-dollar",
                handler: this.showExpenseForm.bind(this)
            });
        },

        showExpenseForm: function () {
            const panel = this.createPanel({ title: "Expense Report", layout: "fit" });
            panel.html(this.renderLayout());
            this.bindEvents(panel.el);
        },

        renderLayout: function () {
            return `
                <div class="expense-wrapper">
                    <div class="expense-header">
                        <label>Currency:</label>
                        <select id="currency">
                            <option value="$">USD ($)</option>
                            <option value="€">EUR (€)</option>
                            <option value="£">GBP (£)</option>
                        </select>
                        <button id="export-csv" class="x-btn">Export CSV</button>
                    </div>

                    <table class="expense-table">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Description</th>
                                <th>Rate</th>
                                <th>Qty</th>
                                <th>Tax %</th>
                                <th>Amount</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody id="expense-body">
                            ${this.renderRow()}
                        </tbody>
                    </table>

                    <div class="expense-footer">
                        <button id="add-row" class="x-btn">Add Line</button>
                        <div class="total">Total: <span id="total">$0.00</span></div>
                    </div>
                </div>
            `;
        },

        renderRow: function () {
            return `
                <tr>
                    <td><input class="type" /></td>
                    <td><input class="desc" /></td>
                    <td><input type="number" class="rate" value="0" min="0" /></td>
                    <td><input type="number" class="qty" value="1" min="0" /></td>
                    <td><input type="number" class="tax" value="0" min="0" /></td>
                    <td class="amount">0.00</td>
                    <td><button class="delete x-btn">✕</button></td>
                </tr>
            `;
        },

        bindEvents: function (el) {
            const recalcRow = (row) => {
                const rate = parseFloat(row.querySelector('.rate').value) || 0;
                const qty = parseFloat(row.querySelector('.qty').value) || 0;
                const tax = parseFloat(row.querySelector('.tax').value) || 0;
                const base = rate * qty;
                const amount = base + (base * tax / 100);
                row.querySelector('.amount').innerText = amount.toFixed(2);
                this.recalcTotal(el);
            };

            el.on('input', '.rate, .qty, .tax', e => recalcRow(e.target.closest('tr')));

            el.on('click', '#add-row', () => {
                el.down('#expense-body').insertHtml('beforeEnd', this.renderRow());
            });

            el.on('click', '.delete', e => {
                e.target.closest('tr').remove();
                this.recalcTotal(el);
            });

            el.on('change', '#currency', () => this.recalcTotal(el));

            el.on('click', '#export-csv', () => this.exportCSV(el));
        },

        recalcTotal: function (el) {
            let total = 0;
            el.select('.amount').forEach(a => total += parseFloat(a.innerText) || 0);
            const cur = el.down('#currency').value;
            el.down('#total').innerText = `${cur}${total.toFixed(2)}`;
        },

        exportCSV: function (el) {
            const rows = [];
            el.select('#expense-body tr').forEach(tr => {
                const cells = tr.querySelectorAll('input, .amount');
                rows.push(Array.from(cells).map(c => c.value || c.innerText));
            });

            const csv = rows.map(r => r.join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'expenses.csv';
            a.click();
        }
    });
});
