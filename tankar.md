if cookie expires:
  1. the user is no longer authenticated
  2. redirect to login
  3. on login, a new cookie is created

this needs to be checked also on the very first GET request


-------------------


rolling reset of expires-attributet i Sequelize-tabellen för Sessions

på alla requests, checka om expired

om expired, svara med HTTP Status Code 403 - Forbidden

om klienten får svarskod 403 - Forbidden, alerta användaren med en modal, t ex
genom vue-js-modal


----

om behöver checka första, sätt boolean: first = true/false

ADD BROADCAST TO SELF (SOCKETS)
