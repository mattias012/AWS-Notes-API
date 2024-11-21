
//function to format the response
export const formatJSONResponse = (statusCode: number, message: any) => {
    return {
      statusCode,
      body: JSON.stringify(message),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  };