//Making a budget controller module that returns an object with methods that are accessible from the outside scope
//A modules always returns an object that exposes a method and variables to the outer environment
var budgetController = (function() {

    // creating a fn constructor to store expense
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalInc) {
        if(totalInc > 0) {
            this.percentage = Math.round((this.value / totalInc) * 100);
        }else {
            this.percentage = -1;
        }
    };

    //The getPercentage function is just so that we have different fns to different tasks
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };


    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };


    // function to calculate the total income and/or expenses
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        // storing th esums in that data
        data.totals[type] = sum;
    }

// Data structure used to store all exp and incomes including the total exp and inc

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        } ,
        budget: 0,
        percentage: -1
    };
    //creating a public method that will allow other modules to give data to budget controller

    return {
        addItem: function(type, des, val) {

            var newItem, ID;
            // ID = last ID + 1, Creating a new ID
            if( data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0; 
            }
            // Create new item based on inc or exp
            if( type === 'exp') {
                newItem = new Expense(ID, des, val)
            }
            else if( type === 'inc') {
                newItem = new Income(ID, des, val)
            }
            // push it into our data structure
            data.allItems[type].push(newItem);

            // return the new element
            return newItem;

        },

        deleteItem: function(type, id) {
            var ids, index;

            //returns all the itmes in either the inc or exp array and stores them in a new array called ids
            var ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            // find the index of the id in the array
            index =  ids.indexOf(id);
            // delete the item according to the index
            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function() {

            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget : income - expenses

            data.budget = data.totals.inc - data.totals.exp;
            //calculate the percentage of income spent

            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },

        calculatePercentages: function() {

            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },


        getPercentages: function() {
          
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage()
            });
            return allPerc;

        },


        // creating a new method to return the results of the calculate budget fn
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        }
    };

})();


              // Making a user interface controller


var UIController = (function() {
// created Domstrings as a best practice to store the inputs in a single place in the case that they are changed
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'

    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec;
        /*
        + or - before number
        exactly 2 decimal points
        comma seperating the thousands
        */

        num = Math.abs(num);// removes -ve from numbers and returns the absolute value
        num = num.toFixed(2);// returns a string with 2 decimal places

        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3) {
            int = int.substr(0, int.length-3) + ',' + int.substr(int.length-3, 3);
        }


        dec = numSplit[1];


        return (type === 'exp' ?  '-' :  '+') + ' ' + int + '.' + dec;

    };

    var nodeListForEach = function(list, callback) {
        for(var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }

    };


    return {
        getInput: function() {

            return {
                type: document.querySelector(DOMstrings.inputType).value,// will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };

        },

        addListItem: function(obj, type ) {
            var html, newHtml, element;
            // create html string with a placeholder text
            if(type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if(type === 'exp') {
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            }

            // replace placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the html into the dom
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItem: function(selectorID) {
            //first selecting the element to delete from the UI
            var el = document.getElementById(selectorID)
            //In javascript u cant simply delete, you must traverse to the parent element then removeChild method is used
            el.parentNode.removeChild(el);

        },

        clearFields: function() {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            // Converting th list returned by the queryselector all method to an array using a trick
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current) {
                current.value = "";
            });

            //sets the focus of the cursor back to the description tab
            fieldsArr[0].focus();
        },
    // Displaying the calculated budget to the UI

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalInc, 'exp');

            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';

            }
        },

        // displaying the expenses percentage in the UI
        displayPercentages: function(percentages) {
            // this returns a nodelist( A nodelist is not an array, it has the length props but can not use array methods on them)
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index) {

                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                }else {
                    current.textContent = '---';
                }

            });

        },

        displayMonth: function() {
            var now, year, months, month;
            var now = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];
            month = now.getMonth();

            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

        },

        changedType: function() {

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red'); 
        },



        getDOMstrings: function() {

            return DOMstrings;
        }
    }

})();


     // Making a module to connect the modules above

var controller = (function(budgetCtrl, UICtrl) {

    // function in which all our event listeners will be placed
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        // adding event listener on a key press event
        document.addEventListener('keypress', function(event) {
            // keycode value of key enter is 13. keyCode is a method of the event object. which is for older browsers
    
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
    // setting up event delegation for the delete button for both income and expense list

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

    };

    var updateBudget = function() {

        //4b. calculate the budget
        budgetCtrl.calculateBudget();

        //5. returns the budget
        var budget = budgetCtrl.getBudget();

        //6. display the budget on the UI
        UICtrl.displayBudget(budget);
    };


    var updatePercentages = function() {

        // 1. calculate the percentages
        budgetCtrl.calculatePercentages();
        // 2. read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        // 3. update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };

    // making a control add item function

    var ctrlAddItem = function() {
        var input, newItem;

         //1. get the input data
         input = UICtrl.getInput();

         if( input.description !== "" && !isNaN(input.value) && input.value > 0) {
             //2. add the item to the budget ctrler
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. add item to the UI
            UICtrl.addListItem(newItem, input.type);

            //3b clear the fields
            UICtrl.clearFields();

            //4. Calculate and update budget
            updateBudget();

            //5. calculate and update percentages
            updatePercentages();

         }
        

    };
    // event is passed as an argument in order to use the event method(target) to know the target element of event bubble
    var ctrlDeleteItem = function(event) {

        var itemID, splitID, type, ID;
        // traversing the dom to get the id of the element we want to delete
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID) {
            // inc-1 or exp-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete the item from data structure
            budgetCtrl.deleteItem(type, ID);

            //2. delete the item from UI
            UICtrl.deleteListItem(itemID);

            //3. Update and show the new budget
            updateBudget();

            //4. calculate and update percentages
            updatePercentages();
        }
    };


    return {
        init: function() {
            console.log('Application has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };

})(budgetController, UIController);

controller.init();