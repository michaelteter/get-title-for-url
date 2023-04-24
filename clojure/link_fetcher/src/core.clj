(ns core
  (:gen-class)
  (:import [org.jsoup Jsoup])
  (:require [clojure.java.io :as io]
            [clojure.string :as str]
            [clojure.java.jdbc :as jdbc]))

(def db-spec {:classname "org.sqlite.JDBC"
              :subprotocol "sqlite"
              :subname (io/file "/Users/mteter/.links.db")})

(defn ensure-http [url]
  (if 
   (or (str/starts-with? url "http://") (str/starts-with? url "https://"))
   url
   (str "http://" url)))

(defn get-title [url]
  (let [url-with-https (ensure-http url)]
    (try
      (let [response (-> (Jsoup/connect url-with-https)
                         (.execute))
            final-url (.url response)
            soup (.parse response)
            title (.text (.select (.head soup) "title"))]
        {:title title :final-url final-url})
      (catch Exception e
        (println (str "Error fetching the URL: " (.getMessage e)))
        {:title "" :final-url ""}))))

(defn read-filtered-links []
  (jdbc/with-db-connection [conn db-spec]
    (let [rows (jdbc/query conn ["SELECT * FROM km_links WHERE title is null or LENGTH(title) = 0;"])]
      (doall rows))))

(defn update-links [url title final-url tries]
  (jdbc/with-db-connection [conn db-spec]
      (let [affected-rows (jdbc/execute! conn ["UPDATE km_links SET title = ?, final_url = ?, title_fetch_attempts = ? WHERE url = ?;"
                                               title final-url tries url])]
        (when (zero? (count affected-rows))
          (println (str "No rows updated for URL: " url))))))

(defn process-row [{:keys [url title_fetch_attempts] :as row}]
  (let [{:keys [title final-url]} (get-title url)]
    (update-links url title final-url (inc title_fetch_attempts)))
  (print ".")
  (flush))

(defn foo [{:keys [title title_fetch_attempts] :as row}]
  (if 
    (str/blank? title) 
    (if (<= title_fetch_attempts 5)
      (do 
        (process-row row)
        (Thread/sleep 1000)))))

(defn -main []
  (let [filtered-rows (read-filtered-links)]
    (doseq [row filtered-rows] (foo row)))
  (println ""))
