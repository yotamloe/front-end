## logzio browser instrumantation
### How to deploy:
* clone the repo
* `npm install`
* build the image:
  ```
  docker build . --tag <your-image-name>
  ```
* Download the opentelemetry collector contrib binary for your os
* Edit otel.yml with your account tokens
* `chmod +x otelcol-contrib`
* `./otelcol-contrib --config otel.yml`
* Edit the front end service in `docker-compose.yml` to your image name
* `docker-compose up`

For k8s you can also use the sockshop [helm chart](https://github.com/microservices-demo/microservices-demo/tree/master/deploy/kubernetes/helm-chart) with your front end image just make sure its publicly available 
