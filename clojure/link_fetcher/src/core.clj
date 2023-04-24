(ns core
  (:gen-class)
  (:import [org.jsoup Jsoup])
  (:require [clojure.java.io :as io]
            [clojure.string :as str]
            [clojure.java.jdbc :as jdbc]))

(def db-spec {:classname "org.sqlite.JDBC"
              :subprotocol "sqlite"
              :subname (io/file "/Users/mteter/.links.db")})

(defn remove-fragment [url]
  (-> (Jsoup/parse url)
      (.setFragment "")
      (.toString)))

(defn ensure-http [url]
  (if 
   (or 
    (str/starts-with? url "http://")
    (str/starts-with? url "https://"))
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

(defn update-links [url title final-url]
  ;; (println (str "URL: " url " || TITLE: " title " || FINAL-URL: " final-url))
  (jdbc/with-db-connection [conn db-spec]
    (let [affected-rows (jdbc/execute! conn ["UPDATE km_links SET title = ?, final_url = ? WHERE url = ?;"
                                             title final-url url])]
      (when (zero? (count affected-rows))
        (println (str "No rows updated for URL: " url))))))

(defn -main []
  (let [filtered-rows (read-filtered-links)]
    (doseq [row filtered-rows]
      (let [url (:url row)
            {:keys [title final-url]} (get-title url)]
        (if (str/blank? title)
          (println (str "No title for url: " url))
          (do
            (println title)
            (update-links (:url row) title final-url)
            (print ".")
            (flush)))
          (Thread/sleep 1000)))
    (println "")))
