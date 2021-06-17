CREATE TABLE IF NOT EXISTS ICON (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(25) NOT NULL UNIQUE,
    location VARCHAR(110) NOT NULL UNIQUE,

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
    gender INT NOT NULL,
    maintenance_cal INT,
    password CHAR(60) NOT NULL,
    account_type INT NOT NULL DEFAULT 0,
    icon_fk INT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),
    FOREIGN KEY (icon_fk) REFERENCES ICON(id)
);
CREATE TABLE IF NOT EXISTS ITEM_CATEGORY (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(25) NOT NULL UNIQUE,
    color VARCHAR(15) NOT NULL,
    icon_fk INT NOT NULL DEFAULT 2,

    PRIMARY KEY (id),
    FOREIGN KEY (icon_fk) REFERENCES ICON(id)
);
CREATE TABLE IF NOT EXISTS ITEM (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(25) NOT NULL UNIQUE,
    calories INT NOT NULL,
    protein INT NOT NULL,
    carbs INT NOT NULL,
    fat INT NOT NULL,
    cost DECIMAL NOT NULL DEFAULT 0.0,
    serving_size VARCHAR(25) NOT NULL,
    icon_fk INT NOT NULL DEFAULT 2,
    category_fk INT NOT NULL,
    user_fk INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),
    FOREIGN KEY (icon_fk) REFERENCES ICON(id),
    FOREIGN KEY (category_fk) REFERENCES ITEM_CATEGORY(id),
    FOREIGN KEY (user_fk) REFERENCES USER(id)
);
CREATE TABLE IF NOT EXISTS MEAL (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(25) NOT NULL,
    description VARCHAR(110),
    user_fk INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),
    FOREIGN KEY (user_fk) REFERENCES USER(id)
);
CREATE TABLE IF NOT EXISTS MEAL_ITEM (
    id INT NOT NULL AUTO_INCREMENT,
    item_fk INT NOT NULL,
    meal_fk INT NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (item_fk) REFERENCES ITEM(id),
    FOREIGN KEY (meal_fk) REFERENCES MEAL(id)
);
CREATE TABLE IF NOT EXISTS MEAL_DATE (
    id INT NOT NULL AUTO_INCREMENT,
    date DATE NOT NULL DEFAULT (DATE(CURRENT_TIMESTAMP)),
    meal_fk INT NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (meal_fk) REFERENCES MEAL(id)
);
CREATE TABLE IF NOT EXISTS UNIT (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(25) NOT NULL,
    sing_abbr VARCHAR(10) NOT NULL,
    plur_abbr VARCHAR(10) NOT NULL,

    PRIMARY KEY (id)
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
    FOREIGN KEY (exercise_type_fk) REFERENCES EXERCISE (id)
);
CREATE TABLE IF NOT EXISTS LIFT (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(25) NOT NULL,
    max_set INT,
    theomax_set INT,
    unit_fk INT NOT NULL,
    user_fk INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),
    FOREIGN KEY (unit_fk) REFERENCES UNIT (id),
    FOREIGN KEY (user_fk) REFERENCES USER (id)
);
CREATE TABLE IF NOT EXISTS LIFT_SET (
    id INT NOT NULL AUTO_INCREMENT,
    set_num INT NOT NULL,
    weight INT NOT NULL,
    reps INT NOT NULL,
    theomax INT NOT NULL,
    date DATE NOT NULL,
    exercise_fk INT NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (exercise_fk) REFERENCES EXERCISE (id),
    
    UNIQUE KEY date_set (exercise_fk, set_num, date)
);
CREATE TABLE IF NOT EXISTS BODYWEIGHT (
    id INT NOT NULL AUTO_INCREMENT,
    weight INT NOT NULL,
    date DATE NOT NULL,
    unit_fk INT NOT NULL,
    user_fk INT NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (unit_fk) REFERENCES UNIT (id),
    FOREIGN KEY (user_fk) REFERENCES USER (id),

    UNIQUE KEY user_date (user_fk, date)
);

INSERT IGNORE INTO icon (id, name, location) VALUES (1, 'default_user', 'defaultUser.png');
INSERT IGNORE INTO icon (id, name, location) VALUES (2, 'default_food', 'defaultFood.png');

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
INSERT IGNORE INTO item_category (id, name, color) VALUES (11, 'Instant Food', '#7FFF00');
INSERT IGNORE INTO item_category (id, name, color) VALUES (12, 'Other', '#FF007F');

INSERT IGNORE INTO unit (id, name, sing_abbr, plur_abbr) VALUES (1, 'kilograms', 'kg', 'kgs');
INSERT IGNORE INTO unit (id, name, sing_abbr, plur_abbr) VALUES (2, 'pounds', 'lb', 'lbs');
INSERT IGNORE INTO unit (id, name, sing_abbr, plur_abbr) VALUES (3, 'kilometres', 'km', 'km');
INSERT IGNORE INTO unit (id, name, sing_abbr, plur_abbr) VALUES (4, 'miles', 'mi', 'mi');
INSERT IGNORE INTO unit (id, name, sing_abbr, plur_abbr) VALUES (5, 'litres', 'ltr', 'ltrs');
INSERT IGNORE INTO unit (id, name, sing_abbr, plur_abbr) VALUES (6, 'quart', 'qt', 'qts');
INSERT IGNORE INTO unit (id, name, sing_abbr, plur_abbr) VALUES (7, 'grams', 'g', 'g');
INSERT IGNORE INTO unit (id, name, sing_abbr, plur_abbr) VALUES (8, 'ounces', 'oz', 'oz');

INSERT IGNORE INTO exercise_type (id, name, description) VALUES (1, 'lift', 'weight lifting');