export class StringUtils {
  
  /**
   * apply trim function to all string fields of the object
   * 
   * @param object 
   * @returns the same object with all the string fields trim
   */
  public static trimObject(object: any) {
    if (object !== undefined && object !== null) {
      switch (typeof object) {
        case 'string' :
          object = object.trim();
          break;
        case 'object':
          if (object instanceof Array) {
            const length = object.length;
            for (let i = 0; i < length; i++) {
              object[i] = this.trimObject(object[i]);
            }
           } else {
            for (let i in object) {
              object[i] = this.trimObject(object[i]);
            }
           }
           break;
      }
    }
    return object;
  }

  /**
   * Convert an object to an one level array of string
   * 
   * @param object 
   * @returns an array of string
   */
  public static fromObjectToArray(object: any): string[] {
    let array: string[] = [];
    if (object !== undefined && object !== null) {
      switch (typeof object) {
        case 'string' :
          array.push(object);
          break;
        case 'object':
          if (object instanceof Array) {
            const length = object.length;
            for (let i = 0; i < length; i++) {
              array.push(...this.fromObjectToArray(object[i]));
            }
           } else {
            for (let i in object) {
              array.push(...this.fromObjectToArray(object[i]));
            }
           }
           break;
      }
    }
    return array;
  }


  /**
   * Convert an email: string to standar email to save in storage
   * 
   * @param string 
   * @returns an string
   */
  public static emailNormalize(email: string): string {
    return email.toLocaleLowerCase().trim();
  }
}