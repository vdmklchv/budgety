//module to control budget data
//
const budgetController = (function() {    //returned an object here
const Expense = function(id, description, value) {   // create function constuctor for expenses
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
};

Expense.prototype.calcPercent = function(totalIncome) {
    if (totalIncome > 0) {
        this.percentage = Math.round((this.value / totalIncome) * 100);
    }
}

Expense.prototype.getPercentage = function() {
    return this.percentage;
}

const Income = function(id, description, value) {   // create function constuctor for expenses
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
};

const data = {
    allItems: {
        inc: [],
        exp: [],
    },
    totals: {
        inc: 0,
        exp: 0,
    },
    budget: 0,
    percentage: -1,
}

const calculateTotal = function(type) {
    let sum = 0;
    data.allItems[type].forEach(function(item) {
        sum += item.value;
    })
    data.totals[type] = sum;
}



return {
    addItem: function(type, desc, val) {
        let newItem, ID;
        if (data.allItems[type].length > 0) {
            ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
        } else {
            ID = 0;
        }
            
        if (type === 'exp') {
            newItem = new Expense(ID, desc, val);
        } else if (type === 'inc') {
            newItem = new Income(ID, desc, val);
        }

        data.allItems[type].push(newItem);
        return newItem;
    },

    deleteItem: function(type, id) {
        let index, ids;
        ids = data.allItems[type].map(function(item) {
            return item.id;
        })
        index = ids.indexOf(id);

        if (index !== -1) {
            data.allItems[type].splice(index, 1);
        }
    },

    calculateBudget: function() {
        //calculate total income and expenses
        calculateTotal('exp');
        calculateTotal('inc');
        // calculate budget = income - expenses
        data.budget = data.totals.inc - data.totals.exp;
        // calculate percentage of income we spent
        if (data.totals.inc > 0) {
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
        }
    },

    calculatePercentages: function() {
        data.allItems.exp.forEach(function(item) {
            item.calcPercent(data.totals.inc);
        })
    },

    getPercentages: function() {
        let allPercents = data.allItems.exp.map(function(current) {
            return current.getPercentage();
        })
        return allPercents;
    },

    getBudget: function() {
        return {
            budget: data.budget,
            totalInc: data.totals.inc,
            totalExp: data.totals.exp,
            percentage: data.percentage,
        };
    },

    testing: function() {
         console.log(data);
    }
}
   
})();


//module to control UI
const uiController = (function() {
    const domStrings = {                    // this is used to store strings of all classes, ids and other selectors 
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        budgetIncLabel: '.budget__income--value',
        budgetExpLabel: '.budget__expenses--value',
        percentLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month',
    }
    const nodeListForEach = function(list, callback) {
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    }

    const formatNumber = function(number, type) {
        let numSplit, int, dec, sign;
        /*
        + or - before num
        2 digits after decimal
        comma separating thousands
        */
       num = Math.abs(number);
       num = num.toFixed(2);
       numSplit = num.split('.');
       int = numSplit[0];

       if (int.length > 3) {
           int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
       }
       dec = numSplit[1];

       type === 'exp' ? sign = '-' : sign = '+';

       return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    }
    
    return {
        getInput: function() {
            return {
                type: document.querySelector(domStrings.inputType).value, // will be either 'inc' or 'exp'
                description: document.querySelector(domStrings.inputDescription).value,
                value: parseFloat(document.querySelector(domStrings.inputValue).value),
            } 
        },

        addListItem: function(obj, type) {
            let html, newHTML, element;
            //create HTML string with placeholder text
            if (type === 'inc') {
                element = domStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                element = domStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percentage%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            

            //replace placeholder text with actual data
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));
           // insert HTML into the DOM 
           document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },

        deleteListItem: function(selectorID) {
            const el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function() {
            let fields, fieldsArray;
            fields = document.querySelectorAll(domStrings.inputDescription + ', ' + domStrings.inputValue);
            fieldsArray = Array.prototype.slice.call(fields);
            fieldsArray.forEach(function(item) {
                item.value = '';
            })
            fieldsArray[0].focus();
        },
        
        displayBudget: function(obj) {
            let type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(domStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(domStrings.budgetIncLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(domStrings.budgetExpLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(domStrings.percentLabel).textContent = obj.percentage +'%';
            } else {
                document.querySelector(domStrings.percentLabel).textContent = '--';
            }
        },

        displayPercentages: function(percentArr) {
            const fields = document.querySelectorAll(domStrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index) {
                if (percentArr[index] === 0) {
                    current.textContent = '--';
                } else {
                    current.textContent = percentArr[index] + '%';
                }
            }
        )},

        displayMonth: function() {
            let year, month, now, monthArr;
            monthArr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            document.querySelector(domStrings.dateLabel).textContent = monthArr[month] + ' ' + year;
        },

        changeType: function() {
            const fields = document.querySelectorAll(domStrings.inputType + ', ' + domStrings.inputDescription + ', ' + domStrings.inputValue);
            nodeListForEach(fields, function(node) {
                node.classList.toggle('red-focus');
            })
            document.querySelector(domStrings.inputBtn).classList.toggle('red');
        },

        getDomStrings: function() { //method to expose DOM strings to the public
            return domStrings;
        }
    }
})();

// global app controller
controller = (function(budgetCtrl, uiCtrl) {

    const setupEventListeners = function() {
        const DOM = uiCtrl.getDomStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem); // here we use a separate ctrlAddItem

        document.addEventListener('keypress', function(e) {
            if (e.keyCode === 13) {
                ctrlAddItem();
            }
        })

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', uiCtrl.changeType);
    }

    const updateBudget = function() {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        // 3. Return the budget
        const budget = budgetCtrl.getBudget();
        // 2. Update the UI (display budget)
        uiCtrl.displayBudget(budget);
    }

    const updatePercentages = function() {
        // calculate percentage
        budgetCtrl.calculatePercentages();

        //read percentage
        const percentages = budgetCtrl.getPercentages();
        //update ui (display percentage)
        uiCtrl.displayPercentages(percentages);
    }


    const ctrlAddItem = function() {
        // 1. get the input data
        const input = uiCtrl.getInput(); //getting the object of inputs from the uiController getInput method

        if (input.description !== '' && !isNaN(input.value) && input.value !== 0) {
            // 2. add the item to the budget controller
            const newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // 3. add the new item to UI
            uiCtrl.addListItem(newItem, input.type);
            uiCtrl.clearFields();
            // 4. calculate and update budget
            updateBudget();

            // calculate and update percentages
            updatePercentages();
        }
    }

    const ctrlDeleteItem = function(event) {
        let itemID, splitID, type, id;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) { 
            splitID = itemID.split('-');
            type = splitID[0];
            id = +splitID[1];
        }

        // delete item from the data structure
        budgetCtrl.deleteItem(type, id);
        // delete item from the UI
        uiCtrl.deleteListItem(itemID);

        // update new totals (budget)
        updateBudget();

        //calculate and update percentages
        updatePercentages();
    }

    return {
        init: function() {
            console.log('The app has started...');
            uiCtrl.displayMonth();
            uiCtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0,
            });
            setupEventListeners();
        }
    }
    
})(budgetController, uiController);

controller.init();