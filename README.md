# Angular Error Handler
A centralize generic error handler for promises in Angular.

## Getting Started
1. Go to your project directory using your command line tool then install the project using npm.

  ```shell
  npm install angular-error-handler
  ```
2. Include angular.js and angular-error-handler.js to your index page.

  ```html
  <script type="text/javascript" src="angular.js"></script>
  <script type="text/javascript" src="angular-error-handler.js"></script>
  ```
3. Add the ngErrorHandler module to you application.

  ```javascript
  angular.module('myApp', ['ngErrorHandler']);
  ```
4. You can now use the 'errorHandlerProvider' to automatically handle the errors of your services.

  ```javascript
  angular.module('myApp').config(function ($provide, errorHandlerProvider) {
    errorHandlerProvider.handle($provide, ['myService', 'myAnotherService']);
  });
  ```
5. You can also set specific functions that you want to manually handle the error.

  ```javascript
  angular.module('myApp').config(function ($provide, errorHandlerProvider) {
    errorHandlerProvider.handle($provide, {
      'myService': ['dontHandleErrorsInThisFunction', 'thisFunctionToo'],
      'myAnotherService': ['meToo']
    });
  });
  ```
6. By default, logging is enabled in errorHandler, you can disable it using the code below.

  ```javascript
  angular.module('myApp').config(function (errorHandlerProvider) {
    errorHandlerProvider.debugEnabled(false);
  });
  ```

## How to use
A simple usage would be is to listen to errors using the errorNotifier service.
Every service functions that is automatically handled by ngErrorHandler that caused
errors will appear here. So it's up to you to do anything that you want with the error.
```javascript
angular.module('myApp').run(function (errorNotifier) {
  errorNotifier.on(function (error) {
    // Do something with the error
  });
});
```

## API Documentation

```javascript
errorHandlerProvider.handle($provide, services);
```
This method sets up all the error handler for your service.
Parameters:
  * $provide - The default $provide service of angular
  * services - Array or string services or an object that contains
    the service name as key, and array of string methods as value
    that you want to manually handle the error

```javascript
errorHandlerProvider.debugEnabled(enable);
```
This method accepts a boolean that enable or disable the logging of ngErrorHandler module.

```javascript
errorNotifier.on(function callback(error) {
  // Do something with the error
});
```
This method accepts a callback that contains the error as a parameter and will be triggered
if there's an error that occured to the functions that is automatically handled by ngErrorHandler.

## License
This project is licensed under the MIT License - see the [LICENSE](https://github.com/TMJPEngineering/angular-error-handler/blob/master/LICENSE)
file for details

## TODO
- Unit tests
- Support for catching exceptions that allows to either halt or continue execution
