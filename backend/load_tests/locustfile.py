from locust import HttpUser, between, task

class WebsiteUser(HttpUser):
    wait_time = between(1, 5)

    @task
    def view_homepage(self):
        self.client.get("/")

    @task
    def view_search_results(self):
        self.client.get("api/search/?search=busser")

    @task
    def view_signin(self):
        self.client.get("api/signin/")

    @task
    def view_postjob(self):
        self.client.get("api/postjob/")