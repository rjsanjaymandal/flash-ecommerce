alter table profiles 
add column loyalty_points integer default 0;

comment on column profiles.loyalty_points is 'Loyalty points accumulated by the user';
