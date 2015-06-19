var app = angular.module('shopApp', ['ngRoute', 'ui.bootstrap', 'ngCookies', 'uiGmapgoogle-maps', 'ngResource', 'angularFileUpload']); // add 'inform' & 'ngAnimate'

/*
app.factory('Api', function($http, $resource) {
	return $resource('/api/:collection/:item');
});
 */
app.factory('mainFactory', function($http, $resource) {

	return {
		
		apiResource : $resource('/api/:collection/:item'),
		
		getProducts : function(queryParam) { return $http.get('data/products/products.json'); },
		
		getCatList : function() { return $http.get('data/products/categories.json'); },
		
		getAttrList : function() { return $http.get('data/products/attributes.json'); },
		
		getCompanyData : function() { return $http.get('data/home/commonData.json'); }
		
	}; 
});

app.factory('cartFactory', function(){
	
	var myCart = new shoppingCart('shopCart');
	
	return {
		cart : myCart
	};
	
});
	

app.factory('authFactory', function ($cookieStore, $http, $rootScope, $window, $location) {
	
	$rootScope.user = angular.fromJson($window.localStorage.user);
	//$rootScope.userData = $rootScope.user;

	var saveState = function () {
			$window.localStorage.user = angular.toJson($rootScope.user);
			//$rootScope.userData = $rootScope.user;
		};
	
	//********************************************
	// common function postUser(type: login/register/update)
	//********************************************
	
	return {

		login : function (cred, success, error) {
			$http.post('/userLogin', cred)
			.success(function (res, status, headers, config) {
				$rootScope.user = res;
				saveState();
				success(res);
			})
			.error(function (res) {
				// message?
				error(res);
			});
		},

		update : function (cred, success, error) {
			$http.post('/userUpdate', cred)
			.success(function (res) {
				$rootScope.user = res;
				saveState();
				success(res);
			})
			.error(function (res) {
				error(res);
			});
		},
		
		register : function (cred, success, error) {
			$http.post('/userRegister', cred)
			.success(function (res) {
				$rootScope.user = res;
				saveState();
				success(res);
			})
			.error(function (res) {
				error(res);
			});
		},

		logout : function () {
			$cookieStore.remove('token');
			$rootScope.user = {};
			saveState();
			
			if ($location.path() == '/cabinet') $location.path('/home');
		},

	};
});

app.controller('uploadCtrl', function($scope, $upload, $location) {
	
    $scope.$watch('files', function () {
        $scope.upload($scope.files);
    });

    $scope.upload = function (files) {
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                $upload.upload({
                    //url: 'https://angular-file-upload-cors-srv.appspot.com/upload',
					//url: 'http://localhost:3000/upload',
					url: '/upload',
                    fields: {
                        'username': $scope.username
                    },
                    file: file
                }).progress(function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    console.log('progress: ' + progressPercentage + '% ' +
                                evt.config.file.name);
                }).success(function (data, status, headers, config) {
                    console.log('file ' + config.file.name + 'uploaded. Response: ' +
                                JSON.stringify(data));
                });
            }
        }
    };

	
});

app.controller('loginCtrl', function ($scope, $modalInstance, $timeout, authFactory) { // add 'inform'

	$scope.loginMode = true;
	
	$scope.cred = {};
	
	$scope.alerts = [];
	
	$scope.switchMode = function() {
		//$scope.cred = {};
		$scope.cred = {email: '', password: ''};
		$scope.loginMode = !$scope.loginMode
	};
	
	$scope.closeAlert = function(index) {
		$scope.alerts.splice(index, 1);
	};
	
	$scope.close = function() {$modalInstance.close()};
	
	$scope.login = function () {
		authFactory.login($scope.cred,
			function (res) { // success
			$modalInstance.close();

		},
			function (res) { // error
				//inform.add('wrong passw');
				var msg = { type: 'danger', msg: 'Неверные имя или пароль!' };
				$scope.alerts.push(msg);
				$timeout(function() { $scope.alerts.splice($scope.alerts.indexOf(msg), 1) }, 3000);
				//{ type: 'success', msg: 'Well done! You successfully read this important alert message.' }
		});
	};
	
	$scope.register = function () {
		
		authFactory.register($scope.cred,
			function (res) { $modalInstance.close() },
			function (res) { $scope.alerts.push({ type: 'danger', msg: 'Email уже существует!' }) });
	};


});

app.controller('registerCtrl', function ($scope, $location, authFactory) {

	$scope.userData = {};
	
	$scope.registerUser = function () {
		
		authFactory.register($scope.userData,
			function (res) { // success
			console.log('registered: ', res);
			if ($location.path() == '/register') $location.path('/store');
			},
			function (res) { // error
			console.log('err', res);
			});
	};

});

app.controller('mainCtrl', function ($scope, $modal, $rootScope, $resource, authFactory, mainFactory, cartFactory) {
	
	$scope.closeAlertt = function(alerts, index) { alerts.splice(index, 1) };
	
	$scope.cart = cartFactory.cart;
	
	$rootScope.companyData = {};
	
	mainFactory.getCompanyData().success( function(data) {
		$rootScope.companyData = data;
	});   // http.get.success
	
	//$scope.userData = {};

	$scope.logout = function () {
		authFactory.logout()
	};

	$scope.open = function (size) {

		var modalInstance = $modal.open({
				templateUrl : 'js/loginModal.html',
				controller : 'loginCtrl',
				size : size
			});

		modalInstance.result.then(function () {
			// console.log('aftermath $rootScope.user', $rootScope.user);
		}, function () {});

	};
	
/* 	
	$scope.registerUser = function () {
		
		authFactory.register($scope.userData,
			function (res) { // success
			console.log('registered: ', res);
			},
			function (res) { // error
			console.log('err', res);
			});
	};
 */
/* 
	$scope.updateUser = function () {
		
		authFactory.update($scope.userData,
			function (res) { // success
			console.log('updated: ', res);
			},
			function (res) { // error
			console.log('err', res);
			});
	};
 */	
	$scope.test = function(prodId) { 
/* 
		var resOrders = $resource('/api/orders/:item');
		var newOrder = new resOrders;
		newOrder.author = "GazMyaz";
		newOrder.$save();
 */
 
	};

});

app.controller('homeCtrl', function($scope, mainFactory, cartFactory) {

	$scope.myInterval = 3000;
	var slides = $scope.slides = [];
	$scope.addSlide = function() {
		var newWidth = 600 + slides.length + 1;
		slides.push({
			//image: '/data/home/slide.jpg'
			image: '/data/home/' + slides.length + '.jpg'
			// image: 'http://placekitten.com/' + newWidth + '/300'
			//,text: ['More','Extra','Lots of','Surplus'][slides.length % 4] + ' ' + ['Cats', 'Kittys', 'Felines', 'Cutes'][slides.length % 4]
		});
	};
	for (var i=0; i < 21; i++) {
		$scope.addSlide();
	}
	
	$scope.cart = cartFactory.cart;

	$scope.latestProducts = mainFactory.apiResource.query({collection: 'product', latest: 4, 'kind': 'Товар'}, function(product) {	});

/* 	
 	mainFactory.getProducts('latest').success( function(data) {
		$scope.latestProducts = data.slice(0,4);
	});   // http.get.success
	 */
});

app.controller('aboutCtrl', function($scope, $http, $rootScope){
		
		$scope.map = { center: { latitude: 47.194, longitude: 39.701 }, zoom: 7 };
		
		$scope.map = { center: { latitude: $rootScope.companyData.compAdrLng, longitude: $rootScope.companyData.compAdrAlt }, zoom: 16 };
		$scope.marker = { pos: { latitude: $rootScope.companyData.compAdrLng, longitude: $rootScope.companyData.compAdrAlt } };
		
		$scope.mAttr = {name: '', email: '', text: ''};
		
		$scope.sendMessage = function() {
			// console.log('post: ', email, text);
			$scope.mAttr.subj = $scope.mAttr.name + '<' + $scope.mAttr.email + '>';
			return $http.post('/message', $scope.mAttr);
		}
		
});

app.controller('cabinetCtrl', function($scope, $rootScope, $timeout, authFactory){

	$scope.spinner = false;
	$scope.alerts = [];
	$scope.tab = 'acc';

	$scope.userData = angular.copy($rootScope.user);
	
	$scope.updateUser = function () {
		
		$scope.spinner  = true;
		
		authFactory.update($scope.userData,
			function (res) { // success
			
				 var msg = { type: 'success', msg: 'Данные успешно сохранены.' };
				 $scope.alerts.push(msg);
				 $timeout(function() { $scope.alerts.splice($scope.alerts.indexOf(msg), 1) }, 3000);
				 $scope.spinner  = false;
			},
			function (res) { // error
				$scope.alerts.push({ type: 'danger', msg: 'Не удалось сохранить данные.' });
				$scope.spinner  = false;
			});
	};

});

app.controller('productCtrl', function($scope, $routeParams, mainFactory, cartFactory) {

	$scope.pTab = 0;
	$scope.id = $routeParams.productId;
	
	$scope.amt = 1;
	$scope.cart = cartFactory.cart;
/* 	
 	mainFactory.getProducts().success( function(data) {
		$scope.product = data[$scope.id];
		console.log($scope.product);
	});
 */

	$scope.product = mainFactory.apiResource.get({collection: 'product', item: $scope.id});


	mainFactory.getAttrList().success( function(data) {
		$scope.productAttributes = data;
	}); 
	
	mainFactory.getCatList().success( function(data) {
		$scope.catList = data;
	});

});

app.controller('storeCtrl', function ($scope, $http, $routeParams, mainFactory, cartFactory) {

	$scope.products = [];
	$scope.pagesShown = 0;
	$scope.pageSize = 10;

	$scope.paginationLimit = function(data) {
		return $scope.pageSize * $scope.pagesShown;
	};

	$scope.hasMoreItemsToShow = function() {
		return $scope.pagesShown < ($scope.products.length / $scope.pageSize);
	};

	$scope.showMoreItems = function() {
		$scope.pagesShown = $scope.pagesShown + 1;       
	}; 

	$scope.cart = cartFactory.cart;

	$scope.curCategory = {};
/* 	
 	mainFactory.getProducts().success( function(data) {
		$scope.products = data;
		$scope.showMoreItems();
	});
 */	
	$scope.products = mainFactory.apiResource.query({collection: 'product', stock: true, kind: 'Товар'}, function(product) {
		$scope.showMoreItems();
	});


 	mainFactory.getCatList().success( function(data) {
		var categories = data;
		$scope.curCategory = categories.filter( function(e) {return e.name == $routeParams.category} )[0];
		if ($scope.curCategory) $scope.products = $scope.products.filter( function(e){ return e.category == $scope.curCategory.name; } );
	});
	
	
});


app.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.
			when('/home', {
				templateUrl : 'partials/home.html',
				controller : 'homeCtrl'
			})
			.when('/register', {
				templateUrl : 'partials/register.html',
				controller : 'registerCtrl'
			})
			.when('/store', {
				templateUrl : 'partials/store.html',
				controller : 'storeCtrl'
			})
			.when('/product/:productId', {
				templateUrl : 'partials/product.html',
				controller : 'productCtrl'
			})
			.when('/store/:category', {
				templateUrl : 'partials/store.html',
				// controller : 'storeCtrl'
			})
			.when('/cart', {
				templateUrl : 'partials/cart.html',
				controller : 'cartCtrl'
			})
			.when('/about', {
				templateUrl : 'partials/about.html',
				controller : 'aboutCtrl'
			})
			.when('/cabinet', {
				templateUrl : 'partials/cabinet.html',
				controller : 'cabinetCtrl'
			})
			.when('/upload', {
				templateUrl : 'partials/upload.html',
				controller : 'uploadCtrl'
			})
			.otherwise({
				redirectTo : '/home'
			});
		}
]);
	





app.controller('cartCtrl', function($scope, $http, cartFactory, $resource){
	
	
	$scope.cart = cartFactory.cart;
	$scope.cartIsEmpty = function() {return $scope.cart.items.length == 0 };
	
	$scope.customer = {};
/* 	
	$scope.sendOrder = function() {
		
		$scope.mAttr = {name: 'сайт', email: 'robot@pegasus.com', subj:'поступил заказ'};
		$scope.mAttr.text = 'Покупатель';
		for (var k in $scope.customer) $scope.mAttr.text += '\n' + k + ': ' + $scope.customer[k];
		$scope.mAttr.text += $scope.cart.items.reduce( function(p,c){ return p += '\n' + c.name + '\nкол-во: ' + c.amt; }, '\n\nСпецификация');
		$scope.mAttr.text += '\n\nСумма заказа: ' + $scope.cart.getTotal().sum;
		console.log('post: ', $scope.mAttr.text);
		return $http.post('/message', $scope.mAttr);
	};
	 */
	
	$scope.sendOrder = function() {		

		var resOrders = $resource('/api/orders/:item');
		var newOrder = new resOrders;
		newOrder.author = $scope.user.name;
		newOrder.t_spec = $scope.cart.items;
		newOrder.$save();
		
	};

	
})


function shoppingCart(cartName) {
	this.name = cartName;
    this.checkoutParameters = {};
	this.deliveryPrice = 0;
	this.discount = 0;
    this.items = [];
	this.loadItems();
}

shoppingCart.prototype.editItem = function (act, id, amt, name, price) {

	// act: set, add, del

    amt = toNumb(amt);
	
	var found = false;
	for (var i = 0; i < this.items.length && !found; i++) {
		if (this.items[i].product_id == id) { found = true; break; };
	}
	
	if (act == 'add') {
		if (found) { this.items[i].amt += amt; this.items[i].amt = Math.max(this.items[i].amt, 0); } else { this.items.push({'product_id':id, 'amt':amt, 'name':name, 'price':price}) }
/* 	} else if (act == 'set') {
		found && (this.items[i].amt = amt);
 */	} else if (act == 'del') {
		found && this.items.splice(i, 1);
	}

	// save changes
	this.saveItems();

}

// save items to local storage
shoppingCart.prototype.saveItems = function () {
    if (localStorage != null && JSON != null) {
		this.items.forEach(function(e){e.amt = toNumb(e.amt)});
        // localStorage[this.cartName + "_items"] = JSON.stringify(this.items);
		localStorage[this.cartName + "_items"] = angular.toJson(this.items);
    }
}

// load items from local storage
shoppingCart.prototype.loadItems = function () {
    var items = (localStorage != null) ? localStorage[this.cartName + "_items"] : null;
    if (items != null && JSON != null) {
		this.items = JSON.parse(items);
		// console.log(this.items);
		this.items = this.items.filter(function(e) { return e.amt > 0 });
    }
}

// get the total price for all items currently in the cart
shoppingCart.prototype.getTotal = function () {
    var totals = {price:0, count:0};
    for (var i = 0; i < this.items.length; i++) {
		var item = this.items[i];
		totals.count += parseInt(item.amt);
		totals.price += Math.round(parseFloat(item.amt) * item.price * 100) / 100 ;
        }
	totals.sum = totals.price + this.deliveryPrice - this.discount;
    return totals;
}

function toNumb(n) {
    n = parseInt(n);
	return isNaN(n) ? 0 : n;
}

function setParents(arr, parents) {
	arr.forEach(function (ep){
		ep.parents = parents.concat({name: ep.name});
		ep.sub && setParents(ep.sub, parents.concat({name: ep.name}));
		})
}
