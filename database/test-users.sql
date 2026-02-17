-- Test Users for Assignment 5
-- Password: Password123! (for all users)
-- Employee User
INSERT INTO public.account (
        account_firstname,
        account_lastname,
        account_email,
        account_password,
        account_type
    )
VALUES (
        'Happy',
        'User',
        'happy@340.edu',
        '$2a$10$FsReU7dJjltnNvTv92XwUOhDHnCsx1AOM9YyXYjLbbx2wogGfw1cm',
        'Employee'::account_type
    );
-- Basic Client Users
INSERT INTO public.account (
        account_firstname,
        account_lastname,
        account_email,
        account_password,
        account_type
    )
VALUES (
        'Basic',
        'Client',
        'basic@340.edu',
        '$2a$10$bqZ49.PsBJ5gcy74mheWieTCMaD0EYPe8Obk9RIaIjCPmrotza0j.',
        'Client'::account_type
    );
INSERT INTO public.account (
        account_firstname,
        account_lastname,
        account_email,
        account_password,
        account_type
    )
VALUES (
        'Sally',
        'Jones',
        'sally@jones.com',
        '$2a$10$2fXHAmTXNMLyP28Zuugl6O0/uwZf8OrbKZUEg7.ZWJS6jVLu6a9Ia',
        'Client'::account_type
    );
INSERT INTO public.account (
        account_firstname,
        account_lastname,
        account_email,
        account_password,
        account_type
    )
VALUES (
        'Lori',
        'Robertson',
        'lorirobertson@gmail.com',
        '$2a$10$TFhGZcMRRGCEqCPVFXeJIus5LhGlYOWOCktJC.19CXpnQOKhUx6ki',
        'Client'::account_type
    );
-- Admin Users
INSERT INTO public.account (
        account_firstname,
        account_lastname,
        account_email,
        account_password,
        account_type
    )
VALUES (
        'Manager',
        'Admin',
        'manager@340.edu',
        '$2a$10$tk.zi305N/2WHWbYCl/CXeJZ.qB5WlWdXsx.WQFilkBocdMjk8y3K',
        'Admin'::account_type
    );
INSERT INTO public.account (
        account_firstname,
        account_lastname,
        account_email,
        account_password,
        account_type
    )
VALUES (
        'Admin',
        'User',
        'admin@cse340.net',
        '$2a$10$FU7OGJb.B737hMe.1Ka0O.3ZGZHNzGhQrGrtb7O3ZehH4CqjPqpFO',
        'Admin'::account_type
    );