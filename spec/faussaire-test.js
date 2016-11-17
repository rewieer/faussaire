import faussaire, {Route, Controller, Response} from '../src/faussaire';

describe('Faussaire should mock API', function(){
  faussaire
  .route(Route({
    template: "http://foo.com",
    methods: ["GET"],
    controller: Controller({
      run: () => {
        return Response({
          data: {},
          status: 200,
          statusText: "OK"
        })
      }
    })
  }))
  .route(Route({
    template: "http://bar.com",
    methods: ["GET", "POST"],
    controller: Controller({
      run: (params) => {
        if(params.query.apikey || params.request.apikey){
          return Response({
            data: {},
            status: 200,
            statusText: "OK"
          })
        } else {
          return Response({
            data: {},
            status: 403,
            statusText: "Forbidden"
          })
        }
      }
    })
  }))
  .route(Route({
    template: "http://bar.com/test",
    methods: ["GET"],
    controller: Controller({
      run: () => {
        return Response({
          data: { match: "test" },
          status: 200,
          statusText: "OK"
        })
      }
    })
  }))
  /*
   * These routes are in this order for testing reasons, and are not put there randomly.
   * This is because a call to http://bar.com/test/8/count shouldn't fall on this route but
   * on the next one.
   */
  .route(Route({
    template: "http://bar.com/test/{id}",
    methods: ["GET"],
    controller: Controller({
      run: () => {
        return Response({
          data: { match: "test with id" },
          status: 200,
          statusText: "OK"
        })
      }
    })
  }))
  .route(Route({
    template: "http://bar.com/test/{id}/count",
    methods: ["GET"],
    controller: Controller({
      run: () => {
        return Response({
          data: { match: "test with id and count" },
          status: 200,
          statusText: "OK"
        })
      }
    })
  }))
  ;

  it('should fetch data from a correct URL', function(){
    const response = faussaire.fetch("http://foo.com", "GET");

    expect(response.data).toBeDefined();
    expect(response.status).toBeDefined();
    expect(response.statusText).toBeDefined();
    expect(response.headers).toBeDefined();

    expect(response.data).toEqual({});
    expect(response.status).toEqual(200);
    expect(response.statusText).toEqual("OK");
    expect(response.headers).toEqual({});
  });

  it('should fetch data from a wrong URL', function(){
    try {
      faussaire.fetch("http://wrong.com", "GET");
    } catch(error){
      expect(error.response.status).toEqual(404);
    }
  });

  it('should accept the request having mentionned the apikey in the URL', function(){
    const response = faussaire.fetch("http://bar.com?apikey=azerty", "GET");
    expect(response.status).toEqual(200);
  });

  it('should accept the request having mentionned the apikey in the params', function(){
    const response = faussaire.fetch("http://bar.com?titi=toto", "GET", {
      params: {
        apikey: "azerty"
      }
    });

    expect(response.status).toEqual(200);
  });

  it('should accept the request having mentionned the apikey in the parameters', function(){
    const response = faussaire.fetch("http://bar.com", "GET", {
      params: {
        apikey: "azerty"
      }
    });
    expect(response.status).toEqual(200);
  });

  it('should accept the request having mentionned the apikey in the POST parameters', function(){
    const response = faussaire.fetch("http://bar.com", "POST", {
      data: {
        apikey: "azerty"
      }
    });
    expect(response.status).toEqual(200);
  });

  it('should refuse the request having forgot the apikey', function(){
    try{
      faussaire.fetch("http://bar.com", "GET");
    } catch(error){
      expect(error.response.status).toEqual(403);
    }
  });

  it('should match http://bar.com/test and return object to identify it', function(){
    const response = faussaire.fetch("http://bar.com/test", "GET");
    expect(response.data.match).toEqual("test");
  });

  it('should match http://bar.com/test/(\\d+) and return object to identify it', function(){
    const response = faussaire.fetch("http://bar.com/test/10", "GET");
    expect(response.data.match).toEqual("test with id");
  });

  it('should match http://bar.com/test/(\\d+)/count and return object to identify it with count', function(){
    const response = faussaire.fetch("http://bar.com/test/10/count", "GET");
    expect(response.data.match).toEqual("test with id and count");
  });
});