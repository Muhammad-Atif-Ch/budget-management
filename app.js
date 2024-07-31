var budgetController = (function () {
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (current) {
            console.log('current', current);
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
        percentage: 0,
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
            console.log('new item', newItem);
            data.allItems[type].push(data);
            return newItem
        },

        calculateBudget: function () {
            calculateTotal('exp');
            calculateTotal('inc');

            data.budget = data.totals.inc - data.totals.exp;

            data.percentage = (data.totals.exp / data.totals.inc) * 100;
        },

        getBudget: function () {
            return {
                totalBudget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
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

    };

    // var formatNumber = function (num, type) {
    //     var numSplit, int, dec;
    //     num = Math.abs(num);
    //     num = num.toFixed(2);
    //     numSplit = num.split('.');
    //     int = numSplit[0];
    //     if (int.length > 3) {
    //         int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    //     }
    //     dec = numSplit[1];
    //     return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    // };

    // var nodeListForEach = function (list, callback) {
    //     for (var i = 0; i < list.length; i++) {
    //         callback(list[i], i);
    //     }
    // };

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
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            } else if (type === 'exp') {
                element = DOMstring.expensesList;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">10%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            }

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            return document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        clearFields: function () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstring.inputDescription + ', ' + DOMstring.inputValue);

            fieldsArr = fields.forEach(input => input.value = '');
            // fieldsArr = Array.prototype.slice.call(fields);console.log(fieldsArr1, fieldsArr);
            fields[0].focus();
        },

        displayBudget: function (obj) {
            document.querySelector(DOMstring.budgetLabel).textContent = obj.totalBudget;
            document.querySelector(DOMstring.budgetIncomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstring.budgetExpenseLabel).textContent = obj.totalExp;
            document.querySelector(DOMstring.expensePercentageLabel).textContent = obj.percentage;
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
        })
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

            updateBudget();
        }

    };

    var updateBudget = function () {
        budgetCtrl.calculateBudget();

        var getBudgetData = budgetCtrl.getBudget();

        console.log(getBudgetData);
        UICtrl.displayBudget(getBudgetData);
    };

    return {
        init: function () {
            console.log('Application has started');
            setUpEventListeners();
        }
    }
})(budgetController, UIController);


controller.init();