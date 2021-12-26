CREATE TABLE IF NOT EXISTS ICON (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(25) NOT NULL UNIQUE,
    location VARCHAR(110) NOT NULL UNIQUE,

    PRIMARY KEY (id)
);
CREATE TABLE IF NOT EXISTS ACTIVITY_LEVEL (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(25) NOT NULL,
    description VARCHAR(110) NOT NULL,
    bmr_multiplier FLOAT NOT NULL,

    PRIMARY KEY (id)
);
CREATE TABLE IF NOT EXISTS GENDER (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(25) NOT NULL,
    bmr_num INT NOT NULL,

    PRIMARY KEY (id)
);
CREATE TABLE IF NOT EXISTS WEIGHT_GOAL (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(110) NOT NULL,
    percent DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (id)
);
CREATE TABLE IF NOT EXISTS UNIT (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(25) NOT NULL,
    sing_abbr VARCHAR(10) NOT NULL,
    plur_abbr VARCHAR(10) NOT NULL,

    PRIMARY KEY (id)
);
CREATE TABLE IF NOT EXISTS USER (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(25) NOT NULL,
    username VARCHAR(25) NOT NULL UNIQUE,
    email VARCHAR(260) UNIQUE,
    description VARCHAR(110),
    dob DATE NOT NULL,
    height INT NOT NULL,
    height_unit_fk INT NOT NULL,
    bw_unit_fk INT NOT NULL,
    gender_fk INT NOT NULL,
    activity_level_fk INT NOT NULL,
    weight_goal_fk INT NOT NULL,
    password CHAR(60) NOT NULL,
    account_type INT NOT NULL DEFAULT 0,
    theme INT NOT NULL DEFAULT 0,
    icon_fk INT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),
    FOREIGN KEY (icon_fk) REFERENCES ICON (id),
    FOREIGN KEY (activity_level_fk) REFERENCES ACTIVITY_LEVEL (id),
    FOREIGN KEY (height_unit_fk) REFERENCES UNIT (id),
    FOREIGN KEY (bw_unit_fk) REFERENCES UNIT (id),
    FOREIGN KEY (gender_fk) REFERENCES GENDER (id),
    FOREIGN KEY (weight_goal_fk) REFERENCES WEIGHT_GOAL (id)
);
CREATE TABLE IF NOT EXISTS MAINTENANCE_CALORIES (
    id INT NOT NULL AUTO_INCREMENT,
    bmr INT NOT NULL,
    calories INT NOT NULL,
    date DATE NOT NULL,
    activity_level_fk INT NOT NULL,
    weight_goal_fk INT NOT NULL,
    user_fk INT NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (activity_level_fk) REFERENCES ACTIVITY_LEVEL (id),
    FOREIGN KEY (user_fk) REFERENCES USER (id),
    FOREIGN KEY (weight_goal_fk) REFERENCES WEIGHT_GOAL (id)
);
CREATE TABLE IF NOT EXISTS ITEM_CATEGORY (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(25) NOT NULL UNIQUE,
    color VARCHAR(15) NOT NULL,
    icon_fk INT NOT NULL DEFAULT 2,

    PRIMARY KEY (id),
    FOREIGN KEY (icon_fk) REFERENCES ICON (id)
);
CREATE TABLE IF NOT EXISTS ITEM (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(25) NOT NULL UNIQUE,
    calories INT NOT NULL,
    protein INT NOT NULL,
    carbs INT NOT NULL,
    fat INT NOT NULL,
    cost DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
    serving_size INT NOT NULL,
    serving_size_unit_fk INT NOT NULL,
    icon_fk INT NOT NULL DEFAULT 2,
    category_fk INT NOT NULL,
    user_fk INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),
    FOREIGN KEY (icon_fk) REFERENCES ICON (id),
    FOREIGN KEY (category_fk) REFERENCES ITEM_CATEGORY (id),
    FOREIGN KEY (serving_size_unit_fk) REFERENCES UNIT (id),
    FOREIGN KEY (user_fk) REFERENCES USER (id)
);
CREATE TABLE IF NOT EXISTS MEAL (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(25) NOT NULL,
    description VARCHAR(110),
    user_fk INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),
    FOREIGN KEY (user_fk) REFERENCES USER (id)
);
CREATE TABLE IF NOT EXISTS MEAL_ITEM (
    id INT NOT NULL AUTO_INCREMENT,
    item_fk INT NOT NULL,
    item_percentage DECIMAL(3, 2) NOT NULL,
    meal_fk INT NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (item_fk) REFERENCES ITEM (id),
    FOREIGN KEY (meal_fk) REFERENCES MEAL (id),

    UNIQUE KEY item_meal (item_fk, meal_fk)
);
CREATE TABLE IF NOT EXISTS MEAL_DATE (
    id INT NOT NULL AUTO_INCREMENT,
    date DATE NOT NULL DEFAULT (DATE(CURRENT_TIMESTAMP)),
    meal_fk INT NOT NULL,
    user_fk INT NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (meal_fk) REFERENCES MEAL (id),
    FOREIGN KEY (user_fk) REFERENCES USER (id)
);
CREATE TABLE IF NOT EXISTS EXERCISE_TYPE (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(25) NOT NULL,
    description VARCHAR(110) NOT NULL,

    PRIMARY KEY (id)
);
CREATE TABLE IF NOT EXISTS EXERCISE (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(25) NOT NULL,
    unit_fk INT NOT NULL,
    exercise_type_fk INT NOT NULL,
    user_fk INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),
    FOREIGN KEY (unit_fk) REFERENCES UNIT (id),
    FOREIGN KEY (exercise_type_fk) REFERENCES EXERCISE_TYPE (id),
    FOREIGN KEY (user_fk) REFERENCES USER (id)
);
CREATE TABLE IF NOT EXISTS EXERCISE_SET (
    id INT NOT NULL AUTO_INCREMENT,
    total_time INT,
    distance INT,
    date DATE NOT NULL,
    calories_spent INT NOT NULL,
    exercise_fk INT NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (exercise_fk) REFERENCES EXERCISE (id),

    UNIQUE KEY date_set (exercise_fk, date)
);
CREATE TABLE IF NOT EXISTS MET (
    id INT NOT NULL AUTO_INCREMENT,
    value FLOAT NOT NULL,
    name VARCHAR(25) NOT NULL,
    exercise_type_fk INT NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (exercise_type_fk) REFERENCES EXERCISE_TYPE (id)
);
CREATE TABLE IF NOT EXISTS WORKOUT (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(25) NOT NULL,
    description VARCHAR(255),
    days VARCHAR(7),

    PRIMARY KEY (id)
);
CREATE TABLE IF NOT EXISTS LIFT (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(25) NOT NULL,
    max_set INT,
    theomax_set INT,
    unit_fk INT NOT NULL,
    user_fk INT NOT NULL,
    workout_fk INT NOT NULL,
    starred INT NOT NULL DEFAULT -1,
    created_at DATETIME NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),
    FOREIGN KEY (unit_fk) REFERENCES UNIT (id),
    FOREIGN KEY (user_fk) REFERENCES USER (id),
    FOREIGN KEY (workout_fk) REFERENCES WORKOUT (id)
);
CREATE TABLE IF NOT EXISTS LIFT_SET_PARENT (
    id INT NOT NULL AUTO_INCREMENT,
    set_quantity INT NOT NULL,
    first_set INT,
    top_set INT,
    date DATE NOT NULL,
    lift_fk INT NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (lift_fk) REFERENCES LIFT (id),
    
    UNIQUE KEY date_set (lift_fk, date),

    INDEX date_idx (date ASC) INVISIBLE
);
CREATE TABLE IF NOT EXISTS LIFT_SET (
    id INT NOT NULL AUTO_INCREMENT,
    set_num INT NOT NULL,
    weight INT NOT NULL,
    reps INT NOT NULL,
    theomax DECIMAL(10, 2) NOT NULL,
    lift_set_parent_fk INT NOT NULL,
    lift_fk INT NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (lift_set_parent_fk) REFERENCES LIFT_SET_PARENT (id),
    FOREIGN KEY (lift_fk) REFERENCES LIFT (id),
    
    UNIQUE KEY parent_set_num (lift_set_parent_fk, set_num),

    INDEX theomax_idx (theomax ASC) INVISIBLE
);
CREATE TABLE IF NOT EXISTS BODYWEIGHT (
    id INT NOT NULL AUTO_INCREMENT,
    weight DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    user_fk INT NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (user_fk) REFERENCES USER (id),

    UNIQUE KEY user_date (user_fk, date)
);

INSERT IGNORE INTO icon (id, name, location) VALUES (1, 'default_user', 'defaultUser.png');
INSERT IGNORE INTO icon (id, name, location) VALUES (2, 'default_food', 'defaultFood.png');

INSERT IGNORE INTO activity_level (id, name, description, bmr_multiplier) VALUES (1, 'Sedetary', 'Little to no exercise.', 1.2);
INSERT IGNORE INTO activity_level (id, name, description, bmr_multiplier) VALUES (2, 'Lightly Active', 'Light exercise / sports 1-3 days a week.', 1.375);
INSERT IGNORE INTO activity_level (id, name, description, bmr_multiplier) VALUES (3, 'Moderately Active', 'Moderate exercise / 3-5 days a week.', 1.55);
INSERT IGNORE INTO activity_level (id, name, description, bmr_multiplier) VALUES (4, 'Very Active', 'Hard exercise / sports 6-7 days a week.', 1.725);
INSERT IGNORE INTO activity_level (id, name, description, bmr_multiplier) VALUES (5, 'Extra Active', 'Very hard exercise / sports & physical job or 2x training.', 1.9);

INSERT IGNORE INTO weight_goal (id, name, percent) VALUES (1, 'Extreme Loss (2lb / .9kg a week) = 54% of maintenance.', 0.54);
INSERT IGNORE INTO weight_goal (id, name, percent) VALUES (2, 'Regular Loss (1lb / .45kg a week) = 77% of maintenance.', 0.77);
INSERT IGNORE INTO weight_goal (id, name, percent) VALUES (3, 'Mild Loss (0.5lb / .225kg a week) = 89% of maintenance.', 0.89);
INSERT IGNORE INTO weight_goal (id, name, percent) VALUES (4, 'Maintenance (No change) = 100% of maintenance.', 1.00);
INSERT IGNORE INTO weight_goal (id, name, percent) VALUES (5, 'Mild Gain (0.5lb / .225kg a week) = 111% of maintenance.', 1.11);
INSERT IGNORE INTO weight_goal (id, name, percent) VALUES (6, 'Regular Gain (1lb / .45kg a week) = 123% of maintenance.', 1.23);
INSERT IGNORE INTO weight_goal (id, name, percent) VALUES (7, 'Extreme Gain (2lb / .9kg a week) = 146% of maintenance.', 1.46);

INSERT IGNORE INTO gender (id, name, bmr_num) VALUES (1, 'Male', 5);
INSERT IGNORE INTO gender (id, name, bmr_num) VALUES (2, 'Female', -161);

INSERT IGNORE INTO item_category (id, name, color) VALUES (1, 'Meat', '#FF0000');
INSERT IGNORE INTO item_category (id, name, color) VALUES (2, 'Seafood', '#0000FF');
INSERT IGNORE INTO item_category (id, name, color) VALUES (3, 'Poultry', '#7F00FF');
INSERT IGNORE INTO item_category (id, name, color) VALUES (4, 'Dairy', '#00FFFF');
INSERT IGNORE INTO item_category (id, name, color) VALUES (5, 'Grain', '#FFFF00');
INSERT IGNORE INTO item_category (id, name, color) VALUES (6, 'Bread', '#FF7F00');
INSERT IGNORE INTO item_category (id, name, color) VALUES (7, 'Vegetables', '#00FF00');
INSERT IGNORE INTO item_category (id, name, color) VALUES (8, 'Fruits', '#FF00FF');
INSERT IGNORE INTO item_category (id, name, color) VALUES (9, 'Legumes', '#00FF7F');
INSERT IGNORE INTO item_category (id, name, color) VALUES (10, 'Drinks', '#007FFF');
INSERT IGNORE INTO item_category (id, name, color) VALUES (11, 'Supplements', '#7FFF00');
INSERT IGNORE INTO item_category (id, name, color) VALUES (12, 'Other', '#FF007F');

INSERT IGNORE INTO unit (id, name, sing_abbr, plur_abbr) VALUES (1, 'kilograms', 'kg', 'kgs');
INSERT IGNORE INTO unit (id, name, sing_abbr, plur_abbr) VALUES (2, 'pounds', 'lb', 'lbs');
INSERT IGNORE INTO unit (id, name, sing_abbr, plur_abbr) VALUES (3, 'kilometres', 'km', 'km');
INSERT IGNORE INTO unit (id, name, sing_abbr, plur_abbr) VALUES (4, 'miles', 'mi', 'mi');
INSERT IGNORE INTO unit (id, name, sing_abbr, plur_abbr) VALUES (5, 'centimeters', 'cm', 'cm');
INSERT IGNORE INTO unit (id, name, sing_abbr, plur_abbr) VALUES (6, 'inches', 'in', 'in');
INSERT IGNORE INTO unit (id, name, sing_abbr, plur_abbr) VALUES (7, 'litres', 'ltr', 'ltrs');
INSERT IGNORE INTO unit (id, name, sing_abbr, plur_abbr) VALUES (8, 'millilitres', 'mL', 'mL');
INSERT IGNORE INTO unit (id, name, sing_abbr, plur_abbr) VALUES (9, 'quart', 'qt', 'qts');
INSERT IGNORE INTO unit (id, name, sing_abbr, plur_abbr) VALUES (10, 'ounces', 'oz', 'oz');
INSERT IGNORE INTO unit (id, name, sing_abbr, plur_abbr) VALUES (11, 'grams', 'g', 'g');

INSERT IGNORE INTO user (id, name, username, dob, height, height_unit_fk, bw_unit_fk, gender_fk, activity_level_fk, weight_goal_fk, password, created_at) VALUES (1, 'Deleted', 'Deleted', '2000-01-01', 100, 5, 1, 1, 1, 4, 'NO_PASSWORD', '2000-01-01');

INSERT IGNORE INTO exercise_type (id, name, description) VALUES (1, 'lift', 'weight lifting');

-- INSERT IGNORE INTO item (id, name, calories, protein, carbs, fat, cost, serving_size, serving_size_unit_fk, icon_fk, category_fk, user_fk)
-- VALUES (1, 'Apple', 70, 2, 20, 3, 1.21, 50, 11, 2, 8, 2);
-- INSERT IGNORE INTO item (id, name, calories, protein, carbs, fat, cost, serving_size, serving_size_unit_fk, icon_fk, category_fk, user_fk)
-- VALUES (2, 'Orange', 70, 2, 20, 3, 1.21, 50, 11, 2, 8, 2);
-- INSERT IGNORE INTO item (id, name, calories, protein, carbs, fat, cost, serving_size, serving_size_unit_fk, icon_fk, category_fk, user_fk)
-- VALUES (3, 'Grapes', 70, 2, 20, 3, 1.21, 50, 11, 2, 8, 2);
-- INSERT IGNORE INTO item (id, name, calories, protein, carbs, fat, cost, serving_size, serving_size_unit_fk, icon_fk, category_fk, user_fk)
-- VALUES (4, 'Whole Milk', 150, 10, 5, 8, 0.71, 8, 10, 2, 4, 2);
-- INSERT IGNORE INTO item (id, name, calories, protein, carbs, fat, cost, serving_size, serving_size_unit_fk, icon_fk, category_fk, user_fk)
-- VALUES (5, 'Whey Protein', 140, 25, 0, 1, 0.88, 25, 11, 2, 11, 2);
-- INSERT IGNORE INTO item (id, name, calories, protein, carbs, fat, cost, serving_size, serving_size_unit_fk, icon_fk, category_fk, user_fk)
-- VALUES (6, 'Casein Protein', 120, 24, 0, 1, 1.03, 25, 11, 2, 11, 2);