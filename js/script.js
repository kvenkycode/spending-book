  let expenses = [];
        let paymentHistory = [];

        // Default expenses data - Fixed ID sequence
        const defaultExpenses = [
            { id: 0, name: 'HDFC Loan', category: 'loan', amount: 5291, dueDate: 7, paid: false, totalAmount: 82500, balance: 82500 },
            { id: 1, name: 'Bajaj Finance Loan', category: 'loan', amount: 14500, dueDate: 2, paid: false, totalAmount: 706000, balance: 706000 },
            { id: 2, name: 'Yes Bank Loan', category: 'loan', amount: 21675, dueDate: 8, paid: false, totalAmount: 639090, balance: 639090 },
            { id: 3, name: 'House Rent', category: 'rent', amount: 18000, dueDate: 5, paid: false, totalAmount: null, balance: null },
            { id: 4, name: 'Maid', category: 'House Needs', amount: 2000, dueDate: 5, paid: false, totalAmount: null, balance: null },
            { id: 5, name: 'Petrol Bills', category: 'House Needs', amount: 1500, dueDate: 0, paid: false, totalAmount: null, balance: null },
            { id: 6, name: 'Power Bill', category: 'House Needs', amount: 600, dueDate: 13, paid: false, totalAmount: null, balance: null },
            { id: 7, name: 'Airtel Internet', category: 'House Needs', amount: 1350, dueDate: 28, paid: false, totalAmount: null, balance: null },
            { id: 8, name: 'Groceries', category: 'House Needs', amount: 5000, dueDate: 0, paid: false, totalAmount: null, balance: null },
            { id: 9, name: 'Kurnool House Rent', category: 'House Needs', amount: 7000, dueDate: 5, paid: false, totalAmount: null, balance: null },
            { id: 10, name: 'DWACRA', category: 'loan', amount: 7000, dueDate: 7, paid: false, totalAmount: null, balance: null },
            { id: 11, name: 'SBI CC 4020', category: 'bill', amount: 2500, dueDate: 29, paid: false, totalAmount: 20408, balance: 20408 },
            { id: 12, name: 'SBI CC 8735', category: 'bill', amount: 18267, dueDate: 11, paid: false, totalAmount: 18267, balance: 18267 },
            { id: 13, name: 'IndusInd CC', category: 'bill', amount: 7800, dueDate: 2, paid: false, totalAmount: 45000, balance: 45000 }
        ];


        
        // Load data from localStorage on page load
        function loadData() {
            const savedExpenses = localStorage.getItem('paymentTrackerExpenses');
            const savedHistory = localStorage.getItem('paymentTrackerHistory');
            
            if (savedExpenses) {
                expenses = JSON.parse(savedExpenses);
            } else {
                // If no saved data, use default expenses
                expenses = [...defaultExpenses];
                saveData(); // Save default to localStorage
            }
            if (savedHistory) {
                paymentHistory = JSON.parse(savedHistory);
            }
        }

        // Save data to localStorage
        function saveData() {
            localStorage.setItem('paymentTrackerExpenses', JSON.stringify(expenses));
            localStorage.setItem('paymentTrackerHistory', JSON.stringify(paymentHistory));
        }
        let currentFilter = 'all';
        let uploadImages = [];

        function calculateDaysUntilDue(dueDate) {
            if (dueDate === 0) return 'As Needed';
            
            const today = new Date();
            const currentDay = today.getDate();
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();
            
            let targetDate = new Date(currentYear, currentMonth, dueDate);
            
            if (currentDay > dueDate) {
                targetDate = new Date(currentYear, currentMonth + 1, dueDate);
            }
            
            const diffTime = targetDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) return 'Today';
            if (diffDays === 1) return 'Tomorrow';
            if (diffDays < 0) return 'Overdue';
            return `${diffDays} days`;
        }

        function formatAmount(amount) {
            return '₹' + amount.toLocaleString('en-IN');
        }

        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        }

        function updateSummary() {
            const totalMonthly = expenses.reduce((sum, exp) => sum + exp.amount, 0);
            const totalLoan = expenses.reduce((sum, exp) => {
                if (exp.totalAmount) {
                    return sum + exp.totalAmount;
                }
                return sum;
            }, 0);
            const paid = expenses.filter(e => e.paid).reduce((sum, exp) => sum + exp.amount, 0);
            const pending = totalMonthly - paid;
            const paidCount = expenses.filter(e => e.paid).length;

            document.getElementById('totalMonthlyAmount').textContent = formatAmount(totalMonthly);
            document.getElementById('totalLoanAmount').textContent = formatAmount(totalLoan);
            document.getElementById('paidAmount').textContent = formatAmount(paid);
            document.getElementById('pendingAmount').textContent = formatAmount(pending);
            document.getElementById('paymentCount').textContent = `${paidCount}/${expenses.length}`;
        }

        function togglePayment(id) {
            const expense = expenses.find(e => e.id === id);
            if (expense) {
                expense.paid = !expense.paid;
                saveData();
                renderExpenses();
                updateSummary();
            }
        }

        function openUploadModal(expenseId) {
            const expense = expenses.find(e => e.id === expenseId);
            if (!expense) return;

            document.getElementById('uploadExpenseId').value = expenseId;
            document.getElementById('paymentDate').value = new Date().toISOString().split('T')[0];
            document.getElementById('transactionRef').value = '';
            document.getElementById('paymentNotes').value = '';
            document.getElementById('imagePreview').innerHTML = '';
            uploadImages = [];

            const detailsHtml = `
                <div style="display: grid; grid-template-columns: auto 1fr; gap: var(--space-12);">
                    <strong>Payment:</strong>
                    <span>${expense.name}</span>
                    <strong>Amount:</strong>
                    <span style="color: var(--color-primary); font-weight: 600;">${formatAmount(expense.amount)}</span>
                    <strong>Category:</strong>
                    <span><span class="category ${expense.category.replace(/\s+/g, '-')}">${expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}</span></span>
                </div>
            `;
            document.getElementById('uploadExpenseDetails').innerHTML = detailsHtml;

            document.getElementById('uploadModal').classList.add('active');
        }

        function closeUploadModal() {
            document.getElementById('uploadModal').classList.remove('active');
        }

        function closeViewModal() {
            document.getElementById('viewModal').classList.remove('active');
        }

        function getDaySuffix(day) {
            if (day >= 11 && day <= 13) return 'th';
            switch (day % 10) {
                case 1: return 'st';
                case 2: return 'nd';
                case 3: return 'rd';
                default: return 'th';
            }
        }

        function openAddPaymentModal() {
            document.getElementById('addPaymentForm').reset();
            document.getElementById('addPaymentModal').classList.add('active');
        }

        function closeAddPaymentModal() {
            document.getElementById('addPaymentModal').classList.remove('active');
        }

        document.getElementById('addPaymentForm').addEventListener('submit', function(e) {
            e.preventDefault();

            const totalAmount = document.getElementById('newPaymentTotalAmount').value;
            const balance = document.getElementById('newPaymentBalance').value;

            const newPayment = {
                id: expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1,
                name: document.getElementById('newPaymentName').value,
                category: document.getElementById('newPaymentCategory').value,
                amount: parseInt(document.getElementById('newPaymentAmount').value),
                dueDate: parseInt(document.getElementById('newPaymentDueDate').value),
                totalAmount: totalAmount ? parseInt(totalAmount) : null,
                balance: balance ? parseInt(balance) : null,
                paid: false
            };

            expenses.push(newPayment);
            saveData();
            renderExpenses();
            updateSummary();
            closeAddPaymentModal();

            alert('New payment added successfully!');
        });

        function previewImages(event) {
            const files = event.target.files;
            const previewContainer = document.getElementById('imagePreview');
            
            // Clear the file input after getting files so user can add more
            Array.from(files).forEach((file, index) => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const currentIndex = uploadImages.length;
                        uploadImages.push({
                            data: e.target.result,
                            name: file.name
                        });

                        const previewDiv = document.createElement('div');
                        previewDiv.className = 'preview-item';
                        previewDiv.innerHTML = `
                            <img src="${e.target.result}" alt="${file.name}">
                            <button type="button" class="remove-image" onclick="removeImage(${currentIndex})">×</button>
                        `;
                        previewContainer.appendChild(previewDiv);
                    };
                    reader.readAsDataURL(file);
                }
            });
            
            // Reset the input so user can select more files
            event.target.value = '';
        }

        function removeImage(index) {
            uploadImages.splice(index, 1);
            
            // Re-render all previews with correct indices
            const previewContainer = document.getElementById('imagePreview');
            previewContainer.innerHTML = '';
            
            uploadImages.forEach((img, idx) => {
                const previewDiv = document.createElement('div');
                previewDiv.className = 'preview-item';
                previewDiv.innerHTML = `
                    <img src="${img.data}" alt="${img.name}">
                    <button type="button" class="remove-image" onclick="removeImage(${idx})">×</button>
                `;
                previewContainer.appendChild(previewDiv);
            });
        }

        document.getElementById('uploadForm').addEventListener('submit', function(e) {
            e.preventDefault();

            const expenseId = parseInt(document.getElementById('uploadExpenseId').value);
            const paymentDate = document.getElementById('paymentDate').value;
            const transactionRef = document.getElementById('transactionRef').value;
            const notes = document.getElementById('paymentNotes').value;

            const expense = expenses.find(e => e.id === expenseId);
            if (!expense) return;

            const paymentRecord = {
                id: Date.now(),
                expenseId: expenseId,
                expenseName: expense.name,
                category: expense.category,
                amount: expense.amount,
                paymentDate: paymentDate,
                transactionRef: transactionRef,
                notes: notes,
                invoices: [...uploadImages],
                createdAt: new Date().toISOString()
            };

            paymentHistory.push(paymentRecord);
            
            expense.paid = true;
            saveData();
            renderExpenses();
            updateSummary();
            renderHistory();

            closeUploadModal();

            alert('Payment record saved successfully!');
        });

        function viewPaymentDetails(historyId) {
            const record = paymentHistory.find(h => h.id === historyId);
            if (!record) return;

            let invoicesHtml = '';
            if (record.invoices && record.invoices.length > 0) {
                invoicesHtml = `
                    <div class="form-group">
                        <label>Invoice/Receipt Images</label>
                        <div class="invoice-images">
                            ${record.invoices.map((img, idx) => `
                                <div class="invoice-thumbnail" onclick="viewFullImage('${img.data}')">
                                    <img src="${img.data}" alt="Invoice ${idx + 1}">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }

            const content = `
                <div class="history-details" style="margin-bottom: var(--space-20);">
                    <div class="history-detail">
                        <strong>Payment Name</strong>
                        ${record.expenseName}
                    </div>
                    <div class="history-detail">
                        <strong>Amount</strong>
                        <span style="color: var(--color-primary); font-weight: 600;">${formatAmount(record.amount)}</span>
                    </div>
                    <div class="history-detail">
                        <strong>Category</strong>
                        <span class="category ${record.category.replace(/\s+/g, '-')}">${record.category.charAt(0).toUpperCase() + record.category.slice(1)}</span>
                    </div>
                    <div class="history-detail">
                        <strong>Payment Date</strong>
                        ${formatDate(record.paymentDate)}
                    </div>
                    ${record.transactionRef ? `
                        <div class="history-detail">
                            <strong>Transaction Reference</strong>
                            ${record.transactionRef}
                        </div>
                    ` : ''}
                    ${record.notes ? `
                        <div class="history-detail" style="grid-column: 1 / -1;">
                            <strong>Notes</strong>
                            ${record.notes}
                        </div>
                    ` : ''}
                </div>
                ${invoicesHtml}
            `;

            document.getElementById('viewModalContent').innerHTML = content;
            document.getElementById('viewModal').classList.add('active');
        }

        let currentImageSrc = '';

        function viewFullImage(imageSrc) {
            currentImageSrc = imageSrc;
            document.getElementById('lightboxImage').src = imageSrc;
            document.getElementById('lightbox').classList.add('active');
            // Prevent body scroll when lightbox is open
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            document.getElementById('lightbox').classList.remove('active');
            document.body.style.overflow = 'auto';
        }

        function downloadImage() {
            const link = document.createElement('a');
            link.href = currentImageSrc;
            link.download = `invoice_${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        // Close lightbox on ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeLightbox();
            }
        });

        function renderExpenses() {
            const tbody = document.getElementById('expenseTableBody');
            tbody.innerHTML = '';

            let filteredExpenses = expenses;

            if (currentFilter !== 'all') {
                if (currentFilter === 'pending') {
                    filteredExpenses = expenses.filter(e => !e.paid);
                } else {
                    filteredExpenses = expenses.filter(e => e.category === currentFilter);
                }
            }

            filteredExpenses.sort((a, b) => {
                if (a.dueDate === 0) return 1;
                if (b.dueDate === 0) return -1;
                return a.dueDate - b.dueDate;
            });

            filteredExpenses.forEach(expense => {
                const row = document.createElement('tr');
                row.className = expense.paid ? 'paid' : '';

                const daysUntil = calculateDaysUntilDue(expense.dueDate);
                const dueDateText = expense.dueDate === 0 ? 'As Needed' : `${expense.dueDate}th of month`;

                const hasHistory = paymentHistory.some(h => h.expenseId === expense.id);

                row.innerHTML = `
                    <td class="checkbox-cell">
                        <input type="checkbox" 
                               ${expense.paid ? 'checked' : ''} 
                               onchange="togglePayment(${expense.id})">
                    </td>
                    <td><strong>${expense.name}</strong></td>
                    <td><span class="category ${expense.category.replace(/\s+/g, '-')}">${expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}</span></td>
                    <td class="amount-cell">${formatAmount(expense.amount)}</td>
                    <td class="amount-cell">${expense.totalAmount ? formatAmount(expense.totalAmount) : '-'}</td>
                    <td class="amount-cell" style="color: ${expense.balance && expense.balance > 0 ? 'var(--color-error)' : 'var(--color-text-secondary)'};">
                        ${expense.balance ? formatAmount(expense.balance) : '-'}
                    </td>
                    <td class="date-cell">${dueDateText}</td>
                    <td class="date-cell">${daysUntil}</td>
                    <td><span class="status-badge ${expense.paid ? 'paid' : 'pending'}">${expense.paid ? 'Paid' : 'Pending'}</span></td>
                    <td>
                        <button class="action-btn" onclick="openUploadModal(${expense.id})" title="Upload Invoice">
                            📤 Upload
                        </button>
                        <button class="action-btn" onclick="deletePayment(${expense.id})" title="Delete Payment" style="color: var(--color-error); margin-left: var(--space-4);">
                            🗑️ Delete
                        </button>
                    </td>
                `;

                tbody.appendChild(row);
            });
        }

        let historyDateFilter = { start: null, end: null };

        function filterHistoryByDate() {
            const startDate = document.getElementById('historyStartDate').value;
            const endDate = document.getElementById('historyEndDate').value;
            
            if (startDate && endDate) {
                historyDateFilter = { start: startDate, end: endDate };
                renderHistory();
            } else {
                alert('Please select both start and end dates');
            }
        }

        function clearHistoryFilter() {
            historyDateFilter = { start: null, end: null };
            document.getElementById('historyStartDate').value = '';
            document.getElementById('historyEndDate').value = '';
            renderHistory();
        }

        function renderHistory() {
            const historyContent = document.getElementById('historyContent');
            
            if (paymentHistory.length === 0) {
                historyContent.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📋</div>
                        <h3>No Payment History</h3>
                        <p>Upload invoices for your payments to see transaction history here</p>
                    </div>
                `;
                return;
            }

            let filteredHistory = [...paymentHistory];

            // Apply date filter if set
            if (historyDateFilter.start && historyDateFilter.end) {
                const startDate = new Date(historyDateFilter.start);
                const endDate = new Date(historyDateFilter.end);
                endDate.setHours(23, 59, 59, 999); // Include full end date

                filteredHistory = filteredHistory.filter(record => {
                    const recordDate = new Date(record.paymentDate);
                    return recordDate >= startDate && recordDate <= endDate;
                });
            }

            if (filteredHistory.length === 0) {
                historyContent.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📋</div>
                        <h3>No Payment History Found</h3>
                        <p>No payments found in the selected date range</p>
                    </div>
                `;
                return;
            }

            const sortedHistory = filteredHistory.sort((a, b) => 
                new Date(b.paymentDate) - new Date(a.paymentDate)
            );

            historyContent.innerHTML = sortedHistory.map(record => `
                <div class="history-item">
                    <div class="history-header">
                        <div class="history-title">${record.expenseName}</div>
                        <div class="history-date">${formatDate(record.paymentDate)}</div>
                    </div>
                    <div class="history-details">
                        <div class="history-detail">
                            <strong>Amount</strong>
                            ${formatAmount(record.amount)}
                        </div>
                        <div class="history-detail">
                            <strong>Category</strong>
                            <span class="category ${record.category}">${record.category.charAt(0).toUpperCase() + record.category.slice(1)}</span>
                        </div>
                        ${record.transactionRef ? `
                            <div class="history-detail">
                                <strong>Transaction Ref</strong>
                                ${record.transactionRef}
                            </div>
                        ` : ''}
                        ${record.invoices && record.invoices.length > 0 ? `
                            <div class="history-detail">
                                <strong>Invoices</strong>
                                ${record.invoices.length} file(s) attached
                            </div>
                        ` : ''}
                    </div>
                    ${record.invoices && record.invoices.length > 0 ? `
                        <div class="invoice-images">
                            ${record.invoices.map((img, idx) => `
                                <div class="invoice-thumbnail" onclick="viewFullImage('${img.data}')">
                                    <img src="${img.data}" alt="Invoice ${idx + 1}">
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    <div style="margin-top: var(--space-12);">
                        <button class="action-btn" onclick="viewPaymentDetails(${record.id})">View Full Details</button>
                    </div>
                </div>
            `).join('');
        }

        function filterExpenses(category) {
            currentFilter = category;
            
            document.querySelectorAll('.filters .btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');

            renderExpenses();
        }

        function deletePayment(id) {
            if (!confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
                return;
            }

            const index = expenses.findIndex(e => e.id === id);
            if (index !== -1) {
                expenses.splice(index, 1);
                
                paymentHistory = paymentHistory.filter(h => h.expenseId !== id);
                
                saveData();
                renderExpenses();
                updateSummary();
                renderHistory();
                
                alert('Payment deleted successfully!');
            }
        }

        function switchTab(tabName) {
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });

            event.target.classList.add('active');
            document.getElementById(tabName).classList.add('active');

            if (tabName === 'history') {
                renderHistory();
            }
        }

        // Initialize app
        loadData();
        renderExpenses();
        updateSummary();
        renderHistory();