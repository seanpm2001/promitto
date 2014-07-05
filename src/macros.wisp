(ns promitto.lib.macros)

(defmacro ?
  [x y]
  `(identical? ~x ~y))

(defmacro not?
  [x y]
  `(if (? ~x ~y) false true))

(defmacro unless
  [condition form]
  (list 'if condition nil form))