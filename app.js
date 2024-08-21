var budgetController = (function () {
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calculatePercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (current) {
            sum += current.value;
        });

        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1,
    };

    return {
        addItem: function (type, des, val) {
            var ID, newItem;
            if (data.allItems[type].length > 0) {
                ID = (data.allItems[type].length - 1) + 1;
            } else {
                ID = 0;
            }

            if (type === 'inc') {
                newItem = new Income(ID, des, val);
            } else if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            };
            data.allItems[type].push(newItem);
            return newItem
        },

        calculateBudget: function () {
            calculateTotal('exp');
            calculateTotal('inc');

            data.budget = data.totals.inc - data.totals.exp;

            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
        },

        calculatePercentage: function () {
            data.allItems.exp.forEach(function (cur) {
                cur.calculatePercentage(data.totals.inc);
            });
        },

        getPercentage: function () {
            var allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function () {
            return {
                totalBudget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            }
        },

        deleteItem: function (type, id) {
            var ids, index;
            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        testing: function () {
            console.log(data);
        }
    };
})();

var UIController = (function () {
    var DOMstring;

    DOMstring = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        addBtn: '.add__btn',
        incomeList: '.income__list',
        expensesList: '.expenses__list',
        budgetLabel: '.budget__value',
        budgetIncomeLabel: '.budget__income--value',
        budgetExpenseLabel: '.budget__expenses--value',
        expensePercentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentage: '.item__percentage',
        dateLabel: '.budget__title--month',

    };

    var formatNumber = function (num, type) {
        var int, des;
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];

        let result = "";
        // Keep inserting commas while the length of the string is more than 3
        while (int.length > 3) {
            result = ',' + int.slice(int.length - 3) + result;
            int = int.slice(0, int.length - 3);
        }

        // Append the remaining part of the string
        result = int + result;

        des = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + result + '.' + des;

    };

    var nodeListForeach = function (lists, callback) {
        for (var i = 0; i < lists.length; i++) {
            callback(lists[i], i);
        }
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstring.inputType).value,
                description: document.querySelector(DOMstring.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstring.inputValue).value),
            }
        },

        addListItem: function (obj, type) {
            var html, newHtml, element;

            if (type === 'inc') {
                element = DOMstring.incomeList;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            } else if (type === 'exp') {
                element = DOMstring.expensesList;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">10%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            }

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            return document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        clearFields: function () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstring.inputDescription + ', ' + DOMstring.inputValue);

            fieldsArr = fields.forEach(input => input.value = '');
            fields[0].focus();
        },

        displayBudget: function (obj) {
            var type;
            obj.totalBudget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstring.budgetLabel).textContent = formatNumber(obj.totalBudget, type);
            document.querySelector(DOMstring.budgetIncomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstring.budgetExpenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstring.expensePercentageLabel).textContent = obj.percentage;
            } else {
                document.querySelector(DOMstring.expensePercentageLabel).textContent = '---';
            }
        },

        displayPercentage: function (percentages) {
            var fields = document.querySelectorAll(DOMstring.expensesPercentage);

            nodeListForeach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + "%";
                } else {
                    current.textContent = "---";
                }
            });
        },

        displayMonth: function () {
            var now, months, month, year;
            now = new Date();

            year = now.getFullYear();
            month = now.getMonth();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            document.querySelector(DOMstring.dateLabel).textContent = months[month] + ' ' + year;
        },

        changeType: function () {
            var fields;
            fields = document.querySelectorAll(
                DOMstring.inputType + ',' +
                DOMstring.inputDescription + ',' +
                DOMstring.inputValue
            );

            nodeListForeach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMstring.addBtn).classList.toggle('red');

        },

        deleteListItem: function (id) {
            var el = document.getElementById(id);
            el.parentNode.removeChild(el)
        },

        getDOMString: function () {
            return DOMstring;
        }
    }
})();

var controller = (function (budgetCtrl, UICtrl) {
    var setUpEventListeners = function () {
        var DOM = UICtrl.getDOMString();

        document.querySelector(DOM.addBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    };

    var ctrlAddItem = function () {
        var input, newItem;
        // input type data
        input = UICtrl.getInput();

        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
            // add new record get 
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // add new item to UI
            UICtrl.addListItem(newItem, input.type);
            // clear fields
            UICtrl.clearFields();
            // update budget
            updateBudget();
            // update percentage
            updatePercentage();
        }
    };

    var updateBudget = function () {
        budgetCtrl.calculateBudget();
        var getBudgetData = budgetCtrl.getBudget();
        UICtrl.displayBudget(getBudgetData);
    };

    var updatePercentage = function () {
        // calculate percentage
        budgetCtrl.calculatePercentage();

        // get percentage
        var getPercentage = budgetCtrl.getPercentage();

        // update ui
        UICtrl.displayPercentage(getPercentage);
    };

    var ctrlDeleteItem = function (event) {
        var itemId, splitId, type, id;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemId) {
            splitId = itemId.split('-');
            type = splitId[0];
            id = parseInt(splitId[1]);

            budgetCtrl.deleteItem(type, id);

            UICtrl.deleteListItem(itemId);

            updateBudget();

            updatePercentage();
        }
    };

    return {
        init: function () {
            console.log('Application has started');
            UICtrl.displayMonth();
            setUpEventListeners();
        }
    }
})(budgetController, UIController);


controller.init();